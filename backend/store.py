import os
import json
import uuid
from datetime import datetime

import shutil

DEFAULT_DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
DATA_DIR = os.getenv("DATA_DIR", DEFAULT_DATA_DIR)
USERS_FILE = os.path.join(DATA_DIR, "users.json")
RECORDS_FILE = os.path.join(DATA_DIR, "records.json")
SETTINGS_FILE = os.path.join(DATA_DIR, "settings.json")

def ensure_data_dir():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)
    
    # If using a separate DATA_DIR (e.g. Render Persistent Disk), copy default files if missing
    if DATA_DIR != DEFAULT_DATA_DIR and os.path.exists(DEFAULT_DATA_DIR):
        for fname in ["users.json", "records.json", "settings.json"]:
            src = os.path.join(DEFAULT_DATA_DIR, fname)
            dst = os.path.join(DATA_DIR, fname)
            if os.path.exists(src) and not os.path.exists(dst):
                try:
                    shutil.copy2(src, dst)
                except Exception:
                    pass

    # Initialize users.json if not present
    if not os.path.exists(USERS_FILE):
        default_users = [
            {
                "id": str(uuid.uuid4()),
                "name": "Luis Infante",
                "cedula": "18829227",
                "username": "linfante",
                "password": "18829227",
                "role": "admin",
                "status": "activo",
                "created_at": datetime.now().isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Julio Durán",
                "cedula": "23950926",
                "username": "jduran",
                "password": "23950926",
                "role": "user",
                "status": "activo",
                "created_at": datetime.now().isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Anthony Vivas",
                "cedula": "19452382",
                "username": "avivas",
                "password": "19452382",
                "role": "user",
                "status": "activo",
                "created_at": datetime.now().isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Daniel Castro",
                "cedula": "16544357",
                "username": "dcastro",
                "password": "16544357",
                "role": "user",
                "status": "activo",
                "created_at": datetime.now().isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Jefferson Rivas",
                "cedula": "11691433",
                "username": "jrivas",
                "password": "11691433",
                "role": "user",
                "status": "activo",
                "created_at": datetime.now().isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Luis Betancourt",
                "cedula": "18816670",
                "username": "lbetancourt",
                "password": "18816670",
                "role": "user",
                "status": "activo",
                "created_at": datetime.now().isoformat()
            }
        ]
        save_users(default_users)
        
    # Initialize records.json if not present
    if not os.path.exists(RECORDS_FILE):
        save_records([])

    # Initialize settings.json if not present
    if not os.path.exists(SETTINGS_FILE):
        default_settings = {
            "gmail_user": "",
            "gmail_app_password": "",
            "default_recipients": ""
        }
        save_settings(default_settings)

def _write_json(filepath, data):
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def load_users():
    ensure_data_dir()
    try:
        with open(USERS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def save_users(users):
    _write_json(USERS_FILE, users)

def load_records():
    ensure_data_dir()
    try:
        with open(RECORDS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def save_records(records):
    _write_json(RECORDS_FILE, records)

def load_settings():
    ensure_data_dir()
    try:
        with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"gmail_user": "", "gmail_app_password": "", "default_recipients": ""}

def save_settings(settings):
    _write_json(SETTINGS_FILE, settings)

