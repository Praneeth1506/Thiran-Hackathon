import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")

if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI is not set")

client = MongoClient(
    MONGODB_URI,
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=5000
)

db = client["complaint_system"]

complaint_collection = db["complaints"]
task_collection = db["tasks"]
task_history_collection = db["task_status_history"]
sla_breach_collection = db["sla_breaches"]
