"""
FinSight AI — Expense & Income Service
Handles CRUD operations for transactions, budgets, goals, and synthetic demo seeding.
Strictly isolates data per authenticated user_id.
"""

from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Optional
import random
from database.database import get_db
from database.models import Expense, Income, Budget, Goal


# Standard Category Taxonomy
EXPENSE_CATEGORIES = [
    "Food",
    "Rent",
    "Transport",
    "Shopping",
    "Entertainment",
    "Education",
    "Healthcare",
    "Bills",
    "Subscriptions",
    "Travel",
    "Miscellaneous"
]

INCOME_SOURCES = [
    "Salary",
    "Freelance",
    "Pocket Money",
    "Business",
    "Other"
]


def add_expense(
    user_id: int,
    expense_date: date,
    category: str,
    description: str,
    amount: float
) -> Dict[str, Any]:
    """Adds a new expense record for user."""
    if amount <= 0:
        raise ValueError("Expense amount must be greater than zero.")
    if not category:
        raise ValueError("Please select or specify a category.")

    with get_db() as db:
        record = Expense(
            user_id=user_id,
            date=expense_date,
            category=category.strip(),
            description=(description or "").strip(),
            amount=round(float(amount), 2)
        )
        db.add(record)
        db.commit()
        return {
            "id": record.id,
            "date": record.date.strftime("%Y-%m-%d"),
            "category": record.category,
            "description": record.description,
            "amount": record.amount
        }


def delete_expense(user_id: int, expense_id: int) -> bool:
    """Deletes an expense record owned by user."""
    with get_db() as db:
        record = db.query(Expense).filter(
            Expense.id == expense_id,
            Expense.user_id == user_id
        ).first()
        if record:
            db.delete(record)
            db.commit()
            return True
        return False


def get_user_expenses(
    user_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category: Optional[str] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    search_query: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Retrieves and filters expenses for a specific user."""
    with get_db() as db:
        query = db.query(Expense).filter(Expense.user_id == user_id)

        if start_date:
            query = query.filter(Expense.date >= start_date)
        if end_date:
            query = query.filter(Expense.date <= end_date)
        if category and category != "All":
            query = query.filter(Expense.category == category)
        if min_amount is not None:
            query = query.filter(Expense.amount >= min_amount)
        if max_amount is not None:
            query = query.filter(Expense.amount <= max_amount)
        if search_query:
            pattern = f"%{search_query.strip()}%"
            query = query.filter(
                (Expense.description.ilike(pattern)) | (Expense.category.ilike(pattern))
            )

        records = query.order_by(Expense.date.desc(), Expense.id.desc()).all()
        return [
            {
                "id": r.id,
                "date": r.date.strftime("%Y-%m-%d"),
                "category": r.category,
                "description": r.description or "",
                "amount": float(r.amount)
            }
            for r in records
        ]


def add_income(
    user_id: int,
    income_date: date,
    source: str,
    amount: float
) -> Dict[str, Any]:
    """Adds a new income entry for user."""
    if amount <= 0:
        raise ValueError("Income amount must be greater than zero.")
    if not source:
        raise ValueError("Please select or specify an income source.")

    with get_db() as db:
        record = Income(
            user_id=user_id,
            date=income_date,
            source=source.strip(),
            amount=round(float(amount), 2)
        )
        db.add(record)
        db.commit()
        return {
            "id": record.id,
            "date": record.date.strftime("%Y-%m-%d"),
            "source": record.source,
            "amount": record.amount
        }


def get_user_incomes(
    user_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> List[Dict[str, Any]]:
    """Retrieves income entries for a user."""
    with get_db() as db:
        query = db.query(Income).filter(Income.user_id == user_id)
        if start_date:
            query = query.filter(Income.date >= start_date)
        if end_date:
            query = query.filter(Income.date <= end_date)
        records = query.order_by(Income.date.desc()).all()
        return [
            {
                "id": r.id,
                "date": r.date.strftime("%Y-%m-%d"),
                "source": r.source,
                "amount": float(r.amount)
            }
            for r in records
        ]


def delete_income(user_id: int, income_id: int) -> bool:
    """Deletes an income record owned by user."""
    with get_db() as db:
        record = db.query(Income).filter(
            Income.id == income_id,
            Income.user_id == user_id
        ).first()
        if record:
            db.delete(record)
            db.commit()
            return True
        return False


def set_budget(user_id: int, month: str, category: str, budget_amount: float) -> Dict[str, Any]:
    """Creates or updates a monthly category budget."""
    if budget_amount < 0:
        raise ValueError("Budget amount cannot be negative.")

    with get_db() as db:
        existing = db.query(Budget).filter(
            Budget.user_id == user_id,
            Budget.month == month,
            Budget.category == category
        ).first()

        if existing:
            existing.budget_amount = round(budget_amount, 2)
            db.commit()
            return {"id": existing.id, "month": month, "category": category, "amount": existing.budget_amount}
        else:
            new_budget = Budget(
                user_id=user_id,
                month=month,
                category=category,
                budget_amount=round(budget_amount, 2)
            )
            db.add(new_budget)
            db.commit()
            return {"id": new_budget.id, "month": month, "category": category, "amount": new_budget.budget_amount}


def get_budgets(user_id: int, month: str) -> List[Dict[str, Any]]:
    """Retrieves budgets set for a specific month."""
    with get_db() as db:
        records = db.query(Budget).filter(
            Budget.user_id == user_id,
            Budget.month == month
        ).all()
        return [
            {
                "id": r.id,
                "month": r.month,
                "category": r.category,
                "amount": float(r.budget_amount)
            }
            for r in records
        ]


def add_goal(user_id: int, name: str, target_amount: float, current_amount: float, deadline: Optional[date]) -> Dict[str, Any]:
    """Creates a financial savings goal."""
    if target_amount <= 0:
        raise ValueError("Target amount must be greater than zero.")

    with get_db() as db:
        goal = Goal(
            user_id=user_id,
            name=name.strip(),
            target_amount=round(target_amount, 2),
            current_amount=max(0.0, round(current_amount, 2)),
            deadline=deadline
        )
        db.add(goal)
        db.commit()
        return {
            "id": goal.id,
            "name": goal.name,
            "target_amount": goal.target_amount,
            "current_amount": goal.current_amount,
            "deadline": goal.deadline.strftime("%Y-%m-%d") if goal.deadline else None
        }


def get_goals(user_id: int) -> List[Dict[str, Any]]:
    """Retrieves all goals for the user."""
    with get_db() as db:
        records = db.query(Goal).filter(Goal.user_id == user_id).order_by(Goal.id.asc()).all()
        return [
            {
                "id": r.id,
                "name": r.name,
                "target_amount": float(r.target_amount),
                "current_amount": float(r.current_amount),
                "deadline": r.deadline.strftime("%Y-%m-%d") if r.deadline else None
            }
            for r in records
        ]


def update_goal_progress(user_id: int, goal_id: int, new_amount: float) -> bool:
    """Updates the saved amount toward a goal."""
    with get_db() as db:
        record = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user_id).first()
        if record:
            record.current_amount = max(0.0, round(new_amount, 2))
            db.commit()
            return True
        return False


def delete_goal(user_id: int, goal_id: int) -> bool:
    """Removes a goal."""
    with get_db() as db:
        record = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user_id).first()
        if record:
            db.delete(record)
            db.commit()
            return True
        return False


def clear_user_data(user_id: int) -> None:
    """Clears all financial entries for the user (expenses, income, budgets, goals)."""
    with get_db() as db:
        db.query(Expense).filter(Expense.user_id == user_id).delete()
        db.query(Income).filter(Income.user_id == user_id).delete()
        db.query(Budget).filter(Budget.user_id == user_id).delete()
        db.query(Goal).filter(Goal.user_id == user_id).delete()
        db.commit()


def seed_demo_data(user_id: int, months_count: int = 14) -> int:
    """
    Seeds 14 months of synthetic financial data for the given user.
    Creates realistic monthly salaries, routine rent/food bills, and seasonal variations
    so the ML predictor, charts, and budget warnings illuminate immediately.
    """
    clear_user_data(user_id)

    today = date.today()
    created_count = 0

    with get_db() as db:
        # 1. Generate monthly income & expenses across past N months
        for i in range(months_count, -1, -1):
            # Calculate target month date
            # Go back i months
            year = today.year
            month = today.month - i
            while month <= 0:
                month += 12
                year -= 1

            month_str = f"{year:04d}-{month:02d}"
            
            # Monthly Salary (around ₹50,000 - ₹55,000)
            salary_date = date(year, month, 1)
            salary_amount = 50000.0 + random.choice([0, 2000, 4000, 5000])
            db.add(Income(
                user_id=user_id,
                date=salary_date,
                source="Salary",
                amount=salary_amount
            ))

            # Occasional freelance or bonus (every 3 months)
            if i % 3 == 0 and i > 0:
                db.add(Income(
                    user_id=user_id,
                    date=date(year, month, 15),
                    source="Freelance",
                    amount=random.choice([8000.0, 12000.0, 15000.0])
                ))

            # Base Expenses: Rent, Food, Utilities, Transport, etc.
            # Fixed Rent
            db.add(Expense(
                user_id=user_id,
                date=date(year, month, 2),
                category="Rent",
                description="Apartment Monthly Rent",
                amount=12000.0
            ))
            created_count += 1

            # Bills / Wifi / Electricity
            db.add(Expense(
                user_id=user_id,
                date=date(year, month, 5),
                category="Bills",
                description="Electricity & Broadband",
                amount=random.uniform(2200, 2800)
            ))
            created_count += 1

            # Subscriptions
            db.add(Expense(
                user_id=user_id,
                date=date(year, month, 8),
                category="Subscriptions",
                description="Cloud Storage & Streaming",
                amount=899.0
            ))
            created_count += 1

            # Food / Groceries (multiple entries)
            for day in [4, 11, 18, 25]:
                db.add(Expense(
                    user_id=user_id,
                    date=date(year, month, min(day, 28)),
                    category="Food",
                    description=random.choice(["Supermarket Groceries", "Weekly Dining & Snacks", "Cafe & Lunches", "Online Grocery Delivery"]),
                    amount=round(random.uniform(1400, 2200), 2)
                ))
                created_count += 1

            # Transport
            db.add(Expense(
                user_id=user_id,
                date=date(year, month, 14),
                category="Transport",
                description="Metro Card & Fuel",
                amount=round(random.uniform(2500, 3400), 2)
            ))
            created_count += 1

            # Shopping or Entertainment
            db.add(Expense(
                user_id=user_id,
                date=date(year, month, 20),
                category="Shopping",
                description=random.choice(["Apparel & Footwear", "Tech Accessories", "Home Essentials"]),
                amount=round(random.uniform(2000, 4800), 2)
            ))
            created_count += 1

            if i % 2 == 0:
                db.add(Expense(
                    user_id=user_id,
                    date=date(year, month, 22),
                    category="Entertainment",
                    description="Movies & Weekend Outing",
                    amount=round(random.uniform(1200, 2600), 2)
                ))
                created_count += 1

            # Budgets for recent months
            if i <= 2:
                db.add(Budget(user_id=user_id, month=month_str, category="Food", budget_amount=8000.0))
                db.add(Budget(user_id=user_id, month=month_str, category="Rent", budget_amount=12000.0))
                db.add(Budget(user_id=user_id, month=month_str, category="Transport", budget_amount=3500.0))
                db.add(Budget(user_id=user_id, month=month_str, category="Shopping", budget_amount=4000.0))
                db.add(Budget(user_id=user_id, month=month_str, category="Entertainment", budget_amount=2000.0))

        # 2. Add Starter Goals
        db.add(Goal(
            user_id=user_id,
            name="MacBook Pro / New Laptop",
            target_amount=80000.0,
            current_amount=48000.0,
            deadline=today + timedelta(days=120)
        ))
        db.add(Goal(
            user_id=user_id,
            name="Emergency Fund (6 Months)",
            target_amount=150000.0,
            current_amount=95000.0,
            deadline=today + timedelta(days=365)
        ))
        db.add(Goal(
            user_id=user_id,
            name="Himachal Vacation",
            target_amount=35000.0,
            current_amount=22000.0,
            deadline=today + timedelta(days=90)
        ))

        db.commit()

    return created_count
