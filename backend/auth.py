import os
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET_KEY = os.getenv("SECRET_KEY", "lnet_enterprise_secure_token_secret_key_2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = int(os.getenv("ACCESS_TOKEN_EXPIRE_HOURS", "24"))

security = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    """Genera un hash seguro bcrypt para la contraseña proporcionada."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_and_check_migration(plain_password: str, stored_password: str) -> Tuple[bool, bool]:
    """
    Verifica la contraseña contra el valor almacenado en BD.
    Retorna: (es_valido, requiere_migracion_a_hash)
    - Si la contraseña ya es un hash bcrypt, verifica con bcrypt.
    - Si es texto plano antiguo, verifica directamente y marca que requiere migración.
    Garantiza que ningún usuario existente quede bloqueado.
    """
    if not stored_password:
        return False, False

    # Detección de hash bcrypt estándar
    if stored_password.startswith(("$2b$", "$2a$", "$2y$")):
        try:
            is_valid = bcrypt.checkpw(plain_password.encode("utf-8"), stored_password.encode("utf-8"))
            return is_valid, False
        except Exception:
            return False, False

    # Verificación de contraseña heredada en texto plano
    if plain_password == stored_password:
        return True, True  # Contraseña correcta pero debe ser actualizada a hash bcrypt

    return False, False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Genera un token JWT con expiración."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """Decodifica y valida un token JWT."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

def get_current_user_optional(auth: Optional[HTTPAuthorizationCredentials] = Security(security)) -> Optional[dict]:
    """Retorna los datos del usuario si el token es válido, o None si no hay token."""
    if not auth or not auth.credentials:
        return None
    payload = decode_access_token(auth.credentials)
    if not payload:
        return None
    return payload

def get_current_user(auth: Optional[HTTPAuthorizationCredentials] = Security(security)) -> dict:
    """Exige un token JWT válido y retorna la identidad del usuario."""
    if not auth or not auth.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se proporcionó token de autorización o es inválido.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(auth.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesión expirada o token inválido. Por favor inicie sesión nuevamente.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload

def require_admin(current_user: dict = Security(get_current_user)) -> dict:
    """Verifica que el usuario autenticado tenga rol de administrador."""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado: se requieren permisos de Administrador para esta acción."
        )
    return current_user
