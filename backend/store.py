import os
import json
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional

import database

DEFAULT_DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
DATA_DIR = os.getenv("DATA_DIR", DEFAULT_DATA_DIR)
ATTACHMENTS_DIR = os.path.join(DATA_DIR, "attachments")

def ensure_data_dir():
    """Asegura la existencia de directorios e inicializa la base de datos SQLite con modo WAL."""
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(ATTACHMENTS_DIR):
        os.makedirs(ATTACHMENTS_DIR, exist_ok=True)
    database.init_db()

def get_record_attachments_dir(record_id: str) -> str:
    """Retorna la ruta del directorio de adjuntos para un registro."""
    ensure_data_dir()
    rec_dir = os.path.join(ATTACHMENTS_DIR, record_id)
    os.makedirs(rec_dir, exist_ok=True)
    return rec_dir

def get_attachment_path(record_id: str, filename: str) -> str:
    """Retorna la ruta absoluta de un archivo adjunto evitando ataques de path traversal."""
    safe_filename = os.path.basename(filename)
    return os.path.join(ATTACHMENTS_DIR, record_id, safe_filename)

# ==========================================
# USUARIOS
# ==========================================

def load_users() -> List[Dict[str, Any]]:
    ensure_data_dir()
    conn = database.get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, cedula, username, password, role, status, created_at FROM users ORDER BY name ASC;")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def save_users(users: List[Dict[str, Any]]):
    """Sincroniza la lista de usuarios con la base de datos SQLite."""
    ensure_data_dir()
    conn = database.get_db_connection()
    cursor = conn.cursor()
    # Usar upsert para cada usuario
    for u in users:
        cursor.execute("""
            INSERT INTO users (id, name, cedula, username, password, role, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(username) DO UPDATE SET
                name=excluded.name,
                cedula=excluded.cedula,
                password=excluded.password,
                role=excluded.role,
                status=excluded.status;
        """, (
            u.get("id") or str(uuid.uuid4()),
            u["name"],
            u["cedula"],
            u["username"].lower().strip(),
            u["password"],
            u.get("role", "user"),
            u.get("status", "activo"),
            u.get("created_at") or datetime.now().isoformat()
        ))
    
    # Eliminar los usuarios que ya no estén en la lista
    current_usernames = [u["username"].lower().strip() for u in users]
    if current_usernames:
        placeholders = ",".join(["?"] * len(current_usernames))
        cursor.execute(f"DELETE FROM users WHERE lower(username) NOT IN ({placeholders});", current_usernames)
    
    conn.commit()
    conn.close()

# ==========================================
# REGISTROS / PLANILLAS
# ==========================================

def load_records(username: Optional[str] = None) -> List[Dict[str, Any]]:
    ensure_data_dir()
    conn = database.get_db_connection()
    cursor = conn.cursor()
    if username:
        cursor.execute("""
            SELECT id, solicitud_num, client_name, activities_json, observations,
                   created_by, created_at, email_status, attachments_json,
                   gps_lat, gps_lng, gps_accuracy, signature_data
            FROM records WHERE lower(created_by) = ?
            ORDER BY created_at DESC;
        """, (username.lower().strip(),))
    else:
        cursor.execute("""
            SELECT id, solicitud_num, client_name, activities_json, observations,
                   created_by, created_at, email_status, attachments_json,
                   gps_lat, gps_lng, gps_accuracy, signature_data
            FROM records
            ORDER BY created_at DESC;
        """)
    rows = cursor.fetchall()
    conn.close()

    result = []
    for r in rows:
        try:
            activities = json.loads(r["activities_json"]) if r["activities_json"] else []
        except Exception:
            activities = []
        try:
            attachments = json.loads(r["attachments_json"]) if r["attachments_json"] else []
        except Exception:
            attachments = []

        result.append({
            "id": r["id"],
            "solicitud_num": r["solicitud_num"],
            "client_name": r["client_name"],
            "activities": activities,
            "observations": r["observations"] or "",
            "created_by": r["created_by"],
            "created_at": r["created_at"],
            "email_status": r["email_status"],
            "attachments": attachments,
            "gps_lat": r["gps_lat"],
            "gps_lng": r["gps_lng"],
            "gps_accuracy": r["gps_accuracy"],
            "signature_data": r["signature_data"]
        })
    return result

def add_record(record: Dict[str, Any]):
    ensure_data_dir()
    conn = database.get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO records (
            id, solicitud_num, client_name, activities_json, observations,
            created_by, created_at, email_status, attachments_json,
            gps_lat, gps_lng, gps_accuracy, signature_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        record["id"],
        str(record.get("solicitud_num", "")),
        record.get("client_name", ""),
        json.dumps(record.get("activities", []), ensure_ascii=False),
        record.get("observations", ""),
        record.get("created_by", ""),
        record.get("created_at") or datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        record.get("email_status", "No enviado"),
        json.dumps(record.get("attachments", []), ensure_ascii=False),
        record.get("gps_lat"),
        record.get("gps_lng"),
        record.get("gps_accuracy"),
        record.get("signature_data")
    ))
    conn.commit()
    conn.close()

def save_records(records: List[Dict[str, Any]]):
    """Guarda/actualiza la lista de registros en SQLite."""
    ensure_data_dir()
    conn = database.get_db_connection()
    cursor = conn.cursor()
    for r in records:
        cursor.execute("""
            INSERT INTO records (
                id, solicitud_num, client_name, activities_json, observations,
                created_by, created_at, email_status, attachments_json,
                gps_lat, gps_lng, gps_accuracy, signature_data
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                solicitud_num=excluded.solicitud_num,
                client_name=excluded.client_name,
                activities_json=excluded.activities_json,
                observations=excluded.observations,
                created_by=excluded.created_by,
                created_at=excluded.created_at,
                email_status=excluded.email_status,
                attachments_json=excluded.attachments_json,
                gps_lat=excluded.gps_lat,
                gps_lng=excluded.gps_lng,
                gps_accuracy=excluded.gps_accuracy,
                signature_data=excluded.signature_data;
        """, (
            r["id"],
            str(r.get("solicitud_num", "")),
            r.get("client_name", ""),
            json.dumps(r.get("activities", []), ensure_ascii=False),
            r.get("observations", ""),
            r.get("created_by", ""),
            r.get("created_at") or datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            r.get("email_status", "No enviado"),
            json.dumps(r.get("attachments", []), ensure_ascii=False),
            r.get("gps_lat"),
            r.get("gps_lng"),
            r.get("gps_accuracy"),
            r.get("signature_data")
        ))
    conn.commit()
    conn.close()

# ==========================================
# CONFIGURACIONES (SETTINGS)
# ==========================================

def load_settings() -> Dict[str, str]:
    ensure_data_dir()
    conn = database.get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT key, value FROM settings;")
    rows = cursor.fetchall()
    conn.close()
    settings = {"gmail_user": "", "gmail_app_password": "", "default_recipients": ""}
    for r in rows:
        settings[r["key"]] = r["value"]
    return settings

def save_settings(settings: Dict[str, str]):
    ensure_data_dir()
    conn = database.get_db_connection()
    cursor = conn.cursor()
    for k, v in settings.items():
        cursor.execute("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value;", (k, str(v)))
    conn.commit()
    conn.close()

# ==========================================
# NOTIFICACIONES
# ==========================================

def load_notifications() -> List[Dict[str, Any]]:
    ensure_data_dir()
    conn = database.get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, type, title, message, record_id, solicitud_num, client_name,
               created_by, created_by_name, attachments_count, created_at, read_by_json
        FROM notifications
        ORDER BY created_at DESC
        LIMIT 100;
    """)
    rows = cursor.fetchall()
    conn.close()
    result = []
    for r in rows:
        try:
            read_by = json.loads(r["read_by_json"]) if r["read_by_json"] else []
        except Exception:
            read_by = []
        result.append({
            "id": r["id"],
            "type": r["type"],
            "title": r["title"],
            "message": r["message"],
            "record_id": r["record_id"],
            "solicitud_num": r["solicitud_num"],
            "client_name": r["client_name"],
            "created_by": r["created_by"],
            "created_by_name": r["created_by_name"],
            "attachments_count": r["attachments_count"],
            "created_at": r["created_at"],
            "read_by": read_by
        })
    return result

def add_notification(notification: Dict[str, Any]):
    ensure_data_dir()
    conn = database.get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO notifications (
            id, type, title, message, record_id, solicitud_num, client_name,
            created_by, created_by_name, attachments_count, created_at, read_by_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        notification.get("id") or str(uuid.uuid4())[:8],
        notification.get("type", "new_record"),
        notification.get("title", "Notificación"),
        notification.get("message", ""),
        notification.get("record_id"),
        notification.get("solicitud_num"),
        notification.get("client_name"),
        notification.get("created_by", ""),
        notification.get("created_by_name", ""),
        notification.get("attachments_count", 0),
        notification.get("created_at") or datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        json.dumps(notification.get("read_by", []), ensure_ascii=False)
    ))
    conn.commit()
    conn.close()
    return notification

def save_notifications(notifications: List[Dict[str, Any]]):
    ensure_data_dir()
    conn = database.get_db_connection()
    cursor = conn.cursor()
    if not notifications:
        cursor.execute("DELETE FROM notifications;")
    else:
        for n in notifications:
            cursor.execute("""
                UPDATE notifications SET read_by_json = ? WHERE id = ?;
            """, (
                json.dumps(n.get("read_by", []), ensure_ascii=False),
                n["id"]
            ))
    conn.commit()
    conn.close()

# ==========================================
# INVENTARIO CENTRALIZADO (STOCK GLOBAL)
# ==========================================

def get_inventory() -> List[Dict[str, Any]]:
    """Retorna el catálogo completo de materiales con su stock actual."""
    ensure_data_dir()
    conn = database.get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, code, name, category, unit, stock, min_stock, updated_at
        FROM inventory
        ORDER BY category ASC, name ASC;
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def add_inventory_item(item: Dict[str, Any]) -> Dict[str, Any]:
    """Crea un nuevo ítem en el catálogo de inventario."""
    ensure_data_dir()
    conn = database.get_db_connection()
    cursor = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    item_id = item.get("id") or f"inv-{str(uuid.uuid4())[:6]}"
    code = item["code"].strip().upper()
    stock = float(item.get("stock", 0))
    min_stock = float(item.get("min_stock", 5))

    cursor.execute("""
        INSERT INTO inventory (id, code, name, category, unit, stock, min_stock, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        item_id,
        code,
        item["name"].strip(),
        item.get("category", "General").strip(),
        item.get("unit", "UNID").strip().upper(),
        stock,
        min_stock,
        now_str
    ))

    # Registro de movimiento inicial si stock > 0
    if stock > 0:
        cursor.execute("""
            INSERT INTO inventory_movements (
                id, item_id, item_code, item_name, movement_type, quantity,
                previous_stock, new_stock, reference, created_by, created_at, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            str(uuid.uuid4())[:8],
            item_id,
            code,
            item["name"].strip(),
            "ingreso_manual",
            stock,
            0.0,
            stock,
            "Alta de Nuevo Producto",
            item.get("created_by", "Admin"),
            now_str,
            "Stock inicial cargado al crear producto"
        ))

    conn.commit()
    conn.close()
    return {
        "id": item_id,
        "code": code,
        "name": item["name"].strip(),
        "category": item.get("category", "General").strip(),
        "unit": item.get("unit", "UNID").strip().upper(),
        "stock": stock,
        "min_stock": min_stock,
        "updated_at": now_str
    }

def update_inventory_item(item_id: str, item: Dict[str, Any]) -> Dict[str, Any]:
    """Actualiza datos descriptivos de un producto de inventario."""
    ensure_data_dir()
    conn = database.get_db_connection()
    cursor = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""
        UPDATE inventory SET
            name = ?,
            category = ?,
            unit = ?,
            min_stock = ?,
            updated_at = ?
        WHERE id = ?;
    """, (
        item["name"].strip(),
        item.get("category", "General").strip(),
        item.get("unit", "UNID").strip().upper(),
        float(item.get("min_stock", 5)),
        now_str,
        item_id
    ))
    conn.commit()
    conn.close()
    return {"message": "Producto actualizado con éxito."}

def delete_inventory_item(item_id: str):
    """Elimina un producto del inventario."""
    ensure_data_dir()
    conn = database.get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM inventory WHERE id = ?;", (item_id,))
    conn.commit()
    conn.close()

def adjust_inventory_stock(
    item_id: str,
    quantity_delta: float,
    movement_type: str,
    reference: str,
    created_by: str,
    notes: Optional[str] = ""
) -> Dict[str, Any]:
    """
    Ajusta el stock de un ítem (suma o resta) y crea un registro de auditoría.
    quantity_delta > 0: Ingreso / Reposición
    quantity_delta < 0: Salida / Descuento / Merma
    """
    ensure_data_dir()
    conn = database.get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, code, name, stock FROM inventory WHERE id = ?;", (item_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise ValueError(f"Producto con ID '{item_id}' no existe en el inventario.")

    prev_stock = float(row["stock"])
    new_stock = prev_stock + float(quantity_delta)
    # Evitar stock negativo si se desea, o permitirlo con alerta
    if new_stock < 0:
        new_stock = 0.0

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("UPDATE inventory SET stock = ?, updated_at = ? WHERE id = ?;", (new_stock, now_str, item_id))

    cursor.execute("""
        INSERT INTO inventory_movements (
            id, item_id, item_code, item_name, movement_type, quantity,
            previous_stock, new_stock, reference, created_by, created_at, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, (
        str(uuid.uuid4())[:8],
        row["id"],
        row["code"],
        row["name"],
        movement_type,
        quantity_delta,
        prev_stock,
        new_stock,
        reference,
        created_by,
        now_str,
        notes or ""
    ))

    conn.commit()
    conn.close()

    return {
        "item_id": row["id"],
        "code": row["code"],
        "name": row["name"],
        "previous_stock": prev_stock,
        "new_stock": new_stock,
        "movement_type": movement_type,
        "reference": reference
    }

def deduct_inventory_for_record(activities: List[Dict[str, Any]], solicitud_num: str, created_by: str) -> List[Dict[str, Any]]:
    """
    Deduce automáticamente del inventario los materiales marcados en una planilla enviada por un técnico.
    """
    if not activities:
        return []

    ensure_data_dir()
    conn = database.get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, code, name, stock FROM inventory;")
    all_inventory = [dict(r) for r in cursor.fetchall()]
    conn.close()

    deducted_items = []
    for act in activities:
        if not act.get("checked"):
            continue

        act_id = act.get("id", "")
        # Extraer cantidad numérica de unid_mts
        raw_qty = str(act.get("unid_mts", "1")).strip().replace(",", ".")
        try:
            # Extraer primer número encontrado
            import re
            match = re.search(r"[-+]?\d*\.?\d+", raw_qty)
            qty = float(match.group()) if match else 1.0
        except Exception:
            qty = 1.0

        if qty <= 0:
            qty = 1.0

        # Buscar ítem de inventario coincidente por ID o por Código/Nombre
        matched_item = None
        for item in all_inventory:
            if item["id"] == act_id or item["code"] in (act.get("description", "") or act.get("name", "")):
                matched_item = item
                break
        
        # Si no coincidió por ID directo, buscar por palabras clave
        if not matched_item:
            act_text = f"{act.get('name', '')} {act.get('description', '')}".lower()
            for item in all_inventory:
                if item["name"].lower() in act_text or item["code"].lower() in act_text:
                    matched_item = item
                    break

        if matched_item:
            try:
                detail_note = f"Detalle: {act.get('detail')}" if act.get("detail") else ""
                res = adjust_inventory_stock(
                    item_id=matched_item["id"],
                    quantity_delta=-qty,
                    movement_type="consumo_planilla",
                    reference=f"Solicitud #{solicitud_num}",
                    created_by=created_by,
                    notes=detail_note
                )
                deducted_items.append({
                    "code": matched_item["code"],
                    "name": matched_item["name"],
                    "deducted_qty": qty,
                    "remaining_stock": res["new_stock"]
                })
            except Exception as e:
                print(f"Error deduciendo inventario para {matched_item['name']}: {e}")

    return deducted_items

def get_inventory_movements(limit: int = 150) -> List[Dict[str, Any]]:
    """Retorna el historial de movimientos de inventario ordenados cronológicamente."""
    ensure_data_dir()
    conn = database.get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, item_id, item_code, item_name, movement_type, quantity,
               previous_stock, new_stock, reference, created_by, created_at, notes
        FROM inventory_movements
        ORDER BY created_at DESC
        LIMIT ?;
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]
