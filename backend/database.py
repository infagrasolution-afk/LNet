import os
import json
import sqlite3
import uuid
from datetime import datetime

DEFAULT_DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
DATA_DIR = os.getenv("DATA_DIR", DEFAULT_DATA_DIR)
DB_FILE = os.path.join(DATA_DIR, "lnet.db")

def get_db_connection():
    """Retorna una conexión a SQLite con WAL mode y soporte de claves foráneas."""
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)
    
    conn = sqlite3.connect(DB_FILE, timeout=30.0)
    conn.row_factory = sqlite3.Row
    # Habilitar WAL (Write-Ahead Logging) para alta concurrencia y atomicidad
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    """Inicializa el esquema de tablas en SQLite y ejecuta migración si es necesario."""
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)

    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Tabla de Usuarios
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            cedula TEXT NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            status TEXT NOT NULL DEFAULT 'activo',
            created_at TEXT NOT NULL
        );
    """)

    # 2. Tabla de Registros / Planillas
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS records (
            id TEXT PRIMARY KEY,
            solicitud_num TEXT NOT NULL,
            client_name TEXT NOT NULL,
            activities_json TEXT NOT NULL DEFAULT '[]',
            observations TEXT NOT NULL DEFAULT '',
            created_by TEXT NOT NULL,
            created_at TEXT NOT NULL,
            email_status TEXT NOT NULL DEFAULT 'No enviado',
            attachments_json TEXT NOT NULL DEFAULT '[]',
            gps_lat REAL,
            gps_lng REAL,
            gps_accuracy REAL,
            signature_data TEXT
        );
    """)

    # 3. Tabla de Inventario Centralizado (Catálogo y Stock Global)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS inventory (
            id TEXT PRIMARY KEY,
            code TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            category TEXT NOT NULL DEFAULT 'General',
            unit TEXT NOT NULL DEFAULT 'UNID',
            stock REAL NOT NULL DEFAULT 0,
            min_stock REAL NOT NULL DEFAULT 5,
            updated_at TEXT NOT NULL
        );
    """)

    # 4. Tabla de Movimientos y Auditoría de Inventario
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS inventory_movements (
            id TEXT PRIMARY KEY,
            item_id TEXT NOT NULL,
            item_code TEXT NOT NULL,
            item_name TEXT NOT NULL,
            movement_type TEXT NOT NULL, -- 'ingreso_manual', 'consumo_planilla', 'ajuste', 'inicial'
            quantity REAL NOT NULL,
            previous_stock REAL NOT NULL,
            new_stock REAL NOT NULL,
            reference TEXT, -- e.g. 'Solicitud #2421299' o 'Lote de compra'
            created_by TEXT NOT NULL,
            created_at TEXT NOT NULL,
            notes TEXT,
            FOREIGN KEY (item_id) REFERENCES inventory(id) ON DELETE CASCADE
        );
    """)

    # 5. Tabla de Notificaciones
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL DEFAULT 'new_record',
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            record_id TEXT,
            solicitud_num TEXT,
            client_name TEXT,
            created_by TEXT NOT NULL,
            created_by_name TEXT,
            attachments_count INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            read_by_json TEXT NOT NULL DEFAULT '[]'
        );
    """)

    # 6. Tabla de Configuraciones del Sistema (Key-Value)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
    """)

    conn.commit()
    conn.close()

    # Ejecutar migración desde archivos JSON existentes si la base de datos es nueva
    _migrate_from_json_and_seed_defaults()

def _migrate_from_json_and_seed_defaults():
    """Migra datos existentes desde JSON a SQLite e inicializa catálogo de materiales por defecto."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Migrar Usuarios si la tabla está vacía
    cursor.execute("SELECT COUNT(*) as count FROM users;")
    if cursor.fetchone()["count"] == 0:
        json_users_path = os.path.join(DATA_DIR, "users.json")
        default_users_path = os.path.join(DEFAULT_DATA_DIR, "users.json")
        users_to_import = []
        if os.path.exists(json_users_path):
            try:
                with open(json_users_path, "r", encoding="utf-8") as f:
                    users_to_import = json.load(f)
            except Exception:
                pass
        elif os.path.exists(default_users_path):
            try:
                with open(default_users_path, "r", encoding="utf-8") as f:
                    users_to_import = json.load(f)
            except Exception:
                pass

        if not users_to_import:
            users_to_import = [
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
                    "role": "admin",
                    "status": "activo",
                    "created_at": datetime.now().isoformat()
                }
            ]

        for u in users_to_import:
            cursor.execute("""
                INSERT OR IGNORE INTO users (id, name, cedula, username, password, role, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                u.get("id") or str(uuid.uuid4()),
                u.get("name"),
                u.get("cedula"),
                u.get("username").lower().strip(),
                u.get("password"),
                u.get("role", "user"),
                u.get("status", "activo"),
                u.get("created_at", datetime.now().isoformat())
            ))
        conn.commit()

    # Migrar Registros si la tabla está vacía
    cursor.execute("SELECT COUNT(*) as count FROM records;")
    if cursor.fetchone()["count"] == 0:
        json_records_path = os.path.join(DATA_DIR, "records.json")
        if os.path.exists(json_records_path):
            try:
                with open(json_records_path, "r", encoding="utf-8") as f:
                    recs = json.load(f)
                    for r in recs:
                        cursor.execute("""
                            INSERT OR IGNORE INTO records (
                                id, solicitud_num, client_name, activities_json, observations,
                                created_by, created_at, email_status, attachments_json,
                                gps_lat, gps_lng, gps_accuracy, signature_data
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                        """, (
                            r.get("id") or str(uuid.uuid4())[:8].upper(),
                            str(r.get("solicitud_num", "")),
                            r.get("client_name", ""),
                            json.dumps(r.get("activities", []), ensure_ascii=False),
                            r.get("observations", ""),
                            r.get("created_by", ""),
                            r.get("created_at", datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
                            r.get("email_status", "No enviado"),
                            json.dumps(r.get("attachments", []), ensure_ascii=False),
                            r.get("gps_lat"),
                            r.get("gps_lng"),
                            r.get("gps_accuracy"),
                            r.get("signature_data")
                        ))
                    conn.commit()
            except Exception as e:
                print(f"Nota: No se encontraron registros JSON para migrar: {e}")

    # Migrar Notificaciones
    cursor.execute("SELECT COUNT(*) as count FROM notifications;")
    if cursor.fetchone()["count"] == 0:
        json_notifs_path = os.path.join(DATA_DIR, "notifications.json")
        if os.path.exists(json_notifs_path):
            try:
                with open(json_notifs_path, "r", encoding="utf-8") as f:
                    notifs = json.load(f)
                    for n in notifs:
                        cursor.execute("""
                            INSERT OR IGNORE INTO notifications (
                                id, type, title, message, record_id, solicitud_num,
                                client_name, created_by, created_by_name, attachments_count,
                                created_at, read_by_json
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                        """, (
                            n.get("id") or str(uuid.uuid4())[:8],
                            n.get("type", "new_record"),
                            n.get("title", "Notificación"),
                            n.get("message", ""),
                            n.get("record_id"),
                            n.get("solicitud_num"),
                            n.get("client_name"),
                            n.get("created_by", ""),
                            n.get("created_by_name", ""),
                            n.get("attachments_count", 0),
                            n.get("created_at", datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
                            json.dumps(n.get("read_by", []), ensure_ascii=False)
                        ))
                    conn.commit()
            except Exception:
                pass

    # Migrar Settings
    cursor.execute("SELECT COUNT(*) as count FROM settings;")
    if cursor.fetchone()["count"] == 0:
        json_settings_path = os.path.join(DATA_DIR, "settings.json")
        default_settings = {"gmail_user": "", "gmail_app_password": "", "default_recipients": ""}
        if os.path.exists(json_settings_path):
            try:
                with open(json_settings_path, "r", encoding="utf-8") as f:
                    loaded = json.load(f)
                    default_settings.update(loaded)
            except Exception:
                pass
        
        for k, v in default_settings.items():
            cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);", (k, str(v)))
        conn.commit()

    # Inicializar Catálogo de Inventario por Defecto si está vacío
    cursor.execute("SELECT COUNT(*) as count FROM inventory;")
    if cursor.fetchone()["count"] == 0:
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        default_inventory_items = [
            ("act-1", "INV-FIBRA-01", "Fibra Óptica (1H / 4H Drop)", "Fibra Óptica", "MTS", 2000.0, 300.0),
            ("act-2", "INV-200-0069", "ROSETA OPTICA FTTX 2-PTU", "Rosetas", "UNID", 100.0, 20.0),
            ("act-3", "INV-200-0030", "CONECTOR MECANICO SC-APC", "Conectores", "UNID", 250.0, 40.0),
            ("act-4", "INV-400-0135", "PATCH CORD FIBRA SM SIMPLEX SC-APC / SC-UPC 1.5MT", "Patch Cords", "UNID", 80.0, 15.0),
            ("act-5", "INV-300-0059", "TENSOR FIBRA DROP S/GANCHO TIPO-S", "Herrajes", "UNID", 150.0, 30.0),
            ("act-6", "INV-300-0031", "GANCHO DE FIJACION TIPO-S", "Herrajes", "UNID", 150.0, 30.0),
            ("act-7", "INV-400-0157", "PATCH CORD UTP RJ-45 CAT5E 1MT", "Patch Cords", "UNID", 60.0, 15.0),
            ("act-8", "INV-300-0028", "ETIQUETA SERIALIZADA", "Identificación", "UNID", 500.0, 100.0),
            ("act-9", "INV-100-0047", "Equipo ONT", "Equipos Activos", "UNID", 50.0, 10.0),
            ("act-10", "INV-TUB-CORR-M", "TUBERIA METALICA CORRUGADA", "Tuberías", "MTS", 200.0, 40.0),
            ("act-11", "INV-TUB-CORR-P", "TUBERIA PLASTICA CORRUGADA", "Tuberías", "MTS", 200.0, 40.0),
        ]

        for item_id, code, name, cat, unit, initial_stock, min_s in default_inventory_items:
            cursor.execute("""
                INSERT INTO inventory (id, code, name, category, unit, stock, min_stock, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            """, (item_id, code, name, cat, unit, initial_stock, min_s, now_str))

            # Registro de movimiento inicial
            cursor.execute("""
                INSERT INTO inventory_movements (
                    id, item_id, item_code, item_name, movement_type, quantity,
                    previous_stock, new_stock, reference, created_by, created_at, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                str(uuid.uuid4())[:8],
                item_id,
                code,
                name,
                "inicial",
                initial_stock,
                0.0,
                initial_stock,
                "Inventario Inicial",
                "Sistema",
                now_str,
                "Carga de inventario base del sistema"
            ))

        conn.commit()

    conn.close()
