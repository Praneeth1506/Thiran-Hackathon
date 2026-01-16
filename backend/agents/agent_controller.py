from agents.perception_agent import perception_agent
from agents.priority_agent import priority_agent
from agents.sla_agent import sla_agent
from agents.coordination_agent import coordination_agent
from agents.policies import DEPARTMENT_POLICY

from db.mongo import complaint_collection, task_collection
from datetime import datetime
from bson import ObjectId


def run_agent_pipeline(complaint_text: str, location: str | None):
    perception = perception_agent(complaint_text)

    issues = perception["issues_detected"]
    confidence = perception.get("confidence_score", 1.0)

    priority_result = priority_agent(issues, confidence)
    priority = priority_result["priority"]

    complaint_id = create_complaint(
        complaint_text=complaint_text,
        location=location,
        issues=issues,
        priority=priority,
        confidence=confidence
    )

    sla_map = {}
    for issue in issues:
        sla_map[issue] = sla_agent(issue, priority)

    tasks = coordination_agent(
        issues=issues,
        priority=priority,
        sla_map=sla_map,
        confidence=confidence,
        original_complaint=complaint_text,
        location=location
    )

    save_tasks_to_db(
        tasks=tasks,
        complaint_id=complaint_id,
        complaint_text=complaint_text,
        location=location
    )

    return {
        "complaint_id": str(complaint_id),
        "complaint_context": {
            "original_description": complaint_text,
            "reported_location": location
        },
        "issues_detected": issues,
        "confidence_score": confidence,
        "priority": priority,
        "priority_reason": priority_result["reason"],
        "tasks": tasks
    }


def create_complaint(complaint_text, location, issues, priority, confidence):
    # Determine primary department from the first issue detected
    primary_department = "General"
    if issues and len(issues) > 0:
        primary_department = DEPARTMENT_POLICY.get(issues[0], "General")
    
    result = complaint_collection.insert_one({
        "description": complaint_text,
        "location": location,
        "issues_detected": issues,
        "department": primary_department,
        "priority": priority,
        "confidence_score": confidence,
        "status": "IN_PROGRESS",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })
    return result.inserted_id


def save_tasks_to_db(tasks, complaint_id, complaint_text, location):
    for task in tasks:
        if not task.get("issue"):
            continue
        task_collection.insert_one({
            "complaint_id": complaint_id,
            "issue": task["issue"],
            "title": task.get("work_order_title"),
            "description": task.get("work_order_description"),
            "department": task["department"],
            "priority": task["priority"],
            "sla_hours": extract_hours(task["sla_context"]),
            "status": "ASSIGNED",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "location": location,
            "complaint_text": complaint_text,
            "escalated": False
        })


def extract_hours(sla_context: str) -> float:
    try:
        return float(sla_context.split(" ")[-2])
    except Exception:
        return 0.0

