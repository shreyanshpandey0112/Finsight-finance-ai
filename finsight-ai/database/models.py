"""
FinSight AI — Database Models
Defines the relational schema using SQLAlchemy ORM for SQLite.
Includes foreign key constraints ensuring strict user data isolation.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class User(Base):
    """
    User Account Table.
    Stores registered user credentials with hashed passwords.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships to user financial records
    expenses = relationship("Expense", back_populates="user", cascade="all, delete-orphan")
    incomes = relationship("Income", back_populates="user", cascade="all, delete-orphan")
    budgets = relationship("Budget", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User id={self.id} email='{self.email}'>"


class Expense(Base):
    """
    Expense Transactions Table.
    Tracks individual expenditures categorized by spending area.
    """
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    category = Column(String(60), nullable=False, index=True)
    description = Column(String(255), nullable=True)
    amount = Column(Float, nullable=False)

    user = relationship("User", back_populates="expenses")

    def __repr__(self):
        return f"<Expense id={self.id} amount={self.amount} category='{self.category}'>"


class Income(Base):
    """
    Income Transactions Table.
    Tracks recurring and ad-hoc income streams (Salary, Freelance, etc.).
    """
    __tablename__ = "income"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    source = Column(String(80), nullable=False)
    amount = Column(Float, nullable=False)

    user = relationship("User", back_populates="incomes")

    def __repr__(self):
        return f"<Income id={self.id} amount={self.amount} source='{self.source}'>"


class Budget(Base):
    """
    Monthly Category Budget Table.
    Stores monthly spending limits allocated per category (e.g. '2026-03', 'Food', 5000).
    """
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    month = Column(String(7), nullable=False, index=True)  # Format: YYYY-MM
    category = Column(String(60), nullable=False)
    budget_amount = Column(Float, nullable=False)

    user = relationship("User", back_populates="budgets")

    def __repr__(self):
        return f"<Budget month='{self.month}' category='{self.category}' amount={self.budget_amount}>"


class Goal(Base):
    """
    Financial Goals Table.
    Tracks personal milestones (e.g., Emergency Fund, Laptop, Vacation).
    """
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(120), nullable=False)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0, nullable=False)
    deadline = Column(Date, nullable=True)

    user = relationship("User", back_populates="goals")

    def __repr__(self):
        return f"<Goal id={self.id} name='{self.name}' target={self.target_amount}>"
