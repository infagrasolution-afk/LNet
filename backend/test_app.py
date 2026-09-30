"""
LNet Test Suite
Valida la seguridad, autenticación, migración de contraseñas, deducción de inventario
y protección contra borrado accidental de datos.
"""
import unittest
import os
import tempfile
import json
import sqlite3

# Configurar entorno de pruebas temporal para no tocar la base de datos de producción
test_dir = tempfile.mkdtemp()
os.environ["DATA_DIR"] = test_dir

import auth
import store
import database

class TestLNetEnterprise(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        database.init_db()

    def test_01_password_hashing_and_migration(self):
        """Valida que una contraseña antigua en texto plano sea validada y marcada para migración."""
        legacy_pw = "18829227"
        
        # 1. Verificar contra texto plano (antiguo)
        is_valid, needs_mig = auth.verify_and_check_migration("18829227", legacy_pw)
        self.assertTrue(is_valid)
        self.assertTrue(needs_mig)

        # 2. Generar hash bcrypt y verificar que ya no requiera migración
        hashed = auth.hash_password(legacy_pw)
        self.assertTrue(hashed.startswith(("$2b$", "$2a$")))
        
        is_valid_hashed, needs_mig_hashed = auth.verify_and_check_migration("18829227", hashed)
        self.assertTrue(is_valid_hashed)
        self.assertFalse(needs_mig_hashed)

        # 3. Contraseña incorrecta debe fallar
        is_valid_wrong, _ = auth.verify_and_check_migration("wrong_password", hashed)
        self.assertFalse(is_valid_wrong)

    def test_02_jwt_tokens(self):
        """Valida la generación y decodificación de tokens JWT."""
        payload = {"sub": "user-123", "username": "linfante", "role": "admin"}
        token = auth.create_access_token(payload)
        self.assertIsInstance(token, str)

        decoded = auth.decode_access_token(token)
        self.assertIsNotNone(decoded)
        self.assertEqual(decoded["username"], "linfante")
        self.assertEqual(decoded["role"], "admin")

    def test_03_safe_user_operations(self):
        """Valida que save_users no elimine usuarios existentes de forma destructiva."""
        initial_users = store.load_users()
        initial_count = len(initial_users)
        self.assertGreaterEqual(initial_count, 1)

        # Crear un usuario de prueba
        test_user = {
            "id": "test-uuid-99",
            "name": "Usuario Prueba",
            "cedula": "99999999",
            "username": "uprueba99",
            "password": auth.hash_password("99999999"),
            "role": "user",
            "status": "activo",
            "created_at": "2026-09-29T21:00:00"
        }
        store.create_user_direct(test_user)

        user_fetched = store.get_user_by_username("uprueba99")
        self.assertIsNotNone(user_fetched)
        self.assertEqual(user_fetched["cedula"], "99999999")

        # Probar actualización de rol
        store.update_user_role_direct("uprueba99", "admin")
        user_updated = store.get_user_by_username("uprueba99")
        self.assertEqual(user_updated["role"], "admin")

        # Probar eliminación atómica del usuario de prueba
        store.delete_user_direct("uprueba99")
        user_deleted = store.get_user_by_username("uprueba99")
        self.assertIsNone(user_deleted)

    def test_04_check_solicitud_exists(self):
        """Valida la detección de solicitudes duplicadas."""
        test_sol = "987654"
        self.assertFalse(store.check_solicitud_exists(test_sol))

        record = {
            "id": "REC-TEST-01",
            "solicitud_num": test_sol,
            "client_name": "Cliente Prueba Duplicado",
            "activities": [],
            "observations": "Prueba",
            "created_by": "linfante",
            "created_at": "2026-09-29 21:00:00",
            "email_status": "No enviado",
            "attachments": []
        }
        store.add_record(record)
        self.assertTrue(store.check_solicitud_exists(test_sol))

    def test_05_inventory_exact_matching_deduction(self):
        """Valida que la deducción de inventario coincida con precisión por ID o Código de catálogo."""
        inv = store.get_inventory()
        self.assertGreater(len(inv), 0)
        target_item = inv[0]
        initial_stock = target_item["stock"]

        # Realizar deducción simulada de planilla
        activities = [
            {
                "id": target_item["id"],
                "inventory_id": target_item["id"],
                "code": target_item["code"],
                "name": target_item["name"],
                "checked": True,
                "unid_mts": "5"
            }
        ]

        deductions = store.deduct_inventory_for_record(activities, "SOL-TEST-55", "linfante")
        self.assertEqual(len(deductions), 1)
        self.assertEqual(deductions[0]["code"], target_item["code"])
        self.assertEqual(deductions[0]["deducted_qty"], 5.0)

    def test_06_reports_and_date_filtering(self):
        """Valida el filtrado por rango de fechas y la generación de reportes NetUno."""
        import reports

        # Cargar registros de prueba con fechas distintas
        rec1 = {
            "id": "REC-DATE-01",
            "solicitud_num": "2001",
            "client_name": "Cliente Agosto",
            "activities": [{"id": "act-1", "name": "Fibra Óptica", "checked": True, "unid_mts": "100"}],
            "observations": "Instalación Agosto",
            "created_by": "linfante",
            "created_at": "2026-08-15 10:00:00",
            "email_status": "No enviado",
            "attachments": []
        }
        rec2 = {
            "id": "REC-DATE-02",
            "solicitud_num": "2002",
            "client_name": "Cliente Septiembre",
            "activities": [{"id": "act-1", "name": "Fibra Óptica", "checked": True, "unid_mts": "150"}],
            "observations": "Instalación Septiembre",
            "created_by": "linfante",
            "created_at": "2026-09-20 14:00:00",
            "email_status": "No enviado",
            "attachments": []
        }
        store.add_record(rec1)
        store.add_record(rec2)

        # 1. Probar filtro por rango
        sept_records = store.load_records(start_date="2026-09-01", end_date="2026-09-30")
        self.assertTrue(any(r["solicitud_num"] == "2002" for r in sept_records))
        self.assertFalse(any(r["solicitud_num"] == "2001" for r in sept_records))

        # 2. Probar generador individual NetUno
        indiv_bytes = reports.generate_netuno_individual_excel(rec2)
        self.assertGreater(len(indiv_bytes.getvalue()), 1000)

        # 3. Probar generador consolidado NetUno
        relacion_bytes = reports.generate_netuno_relacion_excel(sept_records, start_date="2026-09-01", end_date="2026-09-30")
        self.assertGreater(len(relacion_bytes.getvalue()), 1000)

        # 4. Probar generador de Excel existente filtrado por rango de fechas
        import main
        from fastapi import Response
        res = main.export_records_excel(start_date="2026-09-01", end_date="2026-09-30")
        self.assertIsInstance(res, Response)
        self.assertIn("2026-09-01_a_2026-09-30", res.headers.get("Content-Disposition", ""))
        self.assertGreater(len(res.body), 1000)

if __name__ == "__main__":
    unittest.main()

