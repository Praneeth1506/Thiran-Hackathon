from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import threading
import time
from bson import ObjectId

from models.schemas import ComplaintInput, StatusUpdateRequest

from agents.perception_agent import perception_agent
from agents.agent_controller import run_agent_pipeline
from agents.monitoring_agent import monitoring_agent
from agents.task_lifecycle import update_task_status
from db.mongo import complaint_collection
from db.mongo import task_collection
from db.mongo import task_history_collection
from db.mongo import sla_breach_collection

load_dotenv()

app = FastAPI(title="Agentic Public Works Complaint System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def serialize_mongo(doc):
    if not doc:
        return doc

    doc["_id"] = str(doc["_id"])

    for key, value in doc.items():
        if isinstance(value, ObjectId):
            doc[key] = str(value)

    return doc


@app.get("/")
def health_check():
    return {"status": "ok"}


@app.post("/agent/perception")
def run_perception(data: ComplaintInput):
    return perception_agent(data.description)

@app.post("/complaint/process")
def process_complaint(data: ComplaintInput):
    return run_agent_pipeline(
        complaint_text=data.description,
        location=data.location
    )

@app.post("/task/{task_id}/status")
def change_task_status(task_id: str, data: StatusUpdateRequest):
    return update_task_status(
        task_id=task_id,
        new_status=data.new_status,
        changed_by=data.changed_by,
        remark=data.reason   
    )

def monitoring_loop():
    while True:
        monitoring_agent()
        time.sleep(10)  

@app.on_event("startup")
def start_monitoring():
    thread = threading.Thread(
        target=monitoring_loop,
        daemon=True
    )
    thread.start()

@app.get("/complaints")
def get_all_complaints():
    complaints = complaint_collection.find().sort("created_at", -1)
    return [serialize_mongo(c) for c in complaints]


@app.get("/tasks")
def get_all_tasks(department: str | None = None):
    query = {}
    if department:
        query["department"] = department

    tasks = task_collection.find(query).sort("created_at", -1)
    return [serialize_mongo(task) for task in tasks]



@app.get("/activity-logs")
def get_activity_logs():
    logs = task_history_collection.find().sort("timestamp", -1)
    return [serialize_mongo(log) for log in logs]


@app.get("/sla-breaches")
def get_sla_breaches():
    breaches = sla_breach_collection.find().sort("detected_at", -1)
    return [serialize_mongo(breach) for breach in breaches]


@app.get("/tasks/{task_id}/activity")
def get_task_activity(task_id: str):
    logs = task_history_collection.find(
        {"task_id": ObjectId(task_id)}
    ).sort("timestamp", -1)

    return [
        {
            **serialize_mongo(log),
            "task_id": str(log["task_id"])
        }
        for log in logs
    ]


@app.delete("/complaint/{complaint_id}")
def delete_complaint(complaint_id: str):
    try:
        result = complaint_collection.delete_one({"_id": ObjectId(complaint_id)})
        if result.deleted_count == 0:
            return {"status": "error", "message": "Complaint not found"}
        
        # Also delete related tasks
        task_collection.delete_many({"complaint_id": ObjectId(complaint_id)})
        
        return {"status": "success", "message": "Complaint and related tasks deleted"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.delete("/task/{task_id}")
def delete_task(task_id: str):
    try:
        result = task_collection.delete_one({"_id": ObjectId(task_id)})
        if result.deleted_count == 0:
            return {"status": "error", "message": "Task not found"}
        
        return {"status": "success", "message": "Task deleted"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

