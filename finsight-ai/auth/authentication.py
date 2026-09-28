"""
FinSight AI — Authentication & Security Service
Implements secure user registration, login, and password hashing with Werkzeug.
Strictly prevents plain-text credential storage.
"""

from typing import Tuple, Optional, Dict, Any
from werkzeug.security import generate_password_hash, check_password_hash
from database.database import get_db
from database.models import User
from utils.helpers import validate_email


def register_user(name: str, email: str, password: str, confirm_password: str) -> Tuple[bool, str]:
    """
    Registers a new user after comprehensive input validation:
    1. Fields not empty
    2. Password and confirmation match
    3. Minimum password length (6 characters)
    4. Valid email pattern
    5. No duplicate email already existing in database
    """
    name = (name or "").strip()
    email = (email or "").strip().lower()

    if not name:
        return False, "Please provide your full name."

    if not email or not validate_email(email):
        return False, "Please enter a valid email address (e.g., student@example.com)."

    if not password:
        return False, "Password cannot be empty."

    if len(password) < 6:
        return False, "Password must be at least 6 characters long."

    if password != confirm_password:
        return False, "Passwords do not match. Please re-enter carefully."

    with get_db() as db:
        # Check duplicate
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            return False, "An account with this email address already exists. Please login."

        # Hash password securely using PBKDF2:SHA256
        pwd_hash = generate_password_hash(password, method="scrypt" if hasattr(generate_password_hash, "default_method") else "pbkdf2:sha256")
        new_user = User(
            name=name,
            email=email,
            password_hash=pwd_hash
        )
        db.add(new_user)
        db.commit()

    return True, "Registration successful! You can now log in."


def authenticate_user(email: str, password: str) -> Tuple[Optional[Dict[str, Any]], str]:
    """
    Validates user credentials against hashed database records.
    Returns user payload dictionary upon success, or None with friendly error message.
    """
    email = (email or "").strip().lower()
    if not email or not password:
        return None, "Please enter both your email and password."

    with get_db() as db:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None, "Invalid email or password. Please check your credentials."

        # Verify password hash
        if not check_password_hash(user.password_hash, password):
            return None, "Invalid email or password. Please check your credentials."

        # Return detached user representation safe for session storage
        user_data = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "created_at": user.created_at.strftime("%Y-%m-%d") if user.created_at else ""
        }
        return user_data, "Login successful!"
