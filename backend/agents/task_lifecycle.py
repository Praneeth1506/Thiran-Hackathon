from db.mongo import task_collection, task_history_collection, complaint_collection
from agents.complaint_lifecycle import check_and_close_complaint
from datetime import datetime
from bson import ObjectId

from fastapi import HTTPException

def update_task_status(task_id: str, new_status: str, changed_by: str, remark: str):
    try:
        task = task_collection.find_one({"_id": ObjectId(task_id)})

        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        old_status = task["status"]

        task_collection.update_one(
            {"_id": ObjectId(task_id)},
            {
                "$set": {
                    "status": new_status,
                    "updated_at": datetime.utcnow()
                }
            }
        )

        task_history_collection.insert_one({
            "task_id": ObjectId(task_id),
            "old_status": old_status,
            "new_status": new_status,
            "changed_by": changed_by,
            "remark": remark,
            "timestamp": datetime.utcnow()
        })

        complaint_id = task.get("complaint_id")
        if complaint_id:
            check_and_close_complaint(complaint_id)

        return {
            "task_id": task_id,
            "old_status": old_status,
            "new_status": new_status,
            "updated_at": datetime.utcnow()
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

def check_and_close_complaint(complaint_id: ObjectId):
    open_tasks = task_collection.count_documents({
        "complaint_id": complaint_id,
        "status": {"$ne": "RESOLVED"}
    })

    if open_tasks == 0:
        complaint_collection.update_one(
            {"_id": complaint_id},
            {
                "$set": {
                    "status": "RESOLVED",
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return True

    return False