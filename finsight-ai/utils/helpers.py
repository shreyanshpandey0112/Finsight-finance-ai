"""
FinSight AI — Formatting and Helper Utilities
Provides Indian Rupee currency formatting, date parsing, CSV validation, and data helpers.
"""

import re
from datetime import datetime, date
from typing import Tuple, Optional
import pandas as pd


def format_inr(amount: float, symbol: str = "₹") -> str:
    """
    Formats a number into standard Indian Rupee notation (e.g., ₹1,50,000 or ₹35,000).
    Negative amounts are displayed as -₹XX,XXX.
    """
    if amount is None:
        return f"{symbol}0"
    
    is_negative = amount < 0
    abs_amt = abs(round(amount))
    s = str(abs_amt)

    if len(s) <= 3:
        formatted = s
    else:
        last3 = s[-3:]
        remaining = s[:-3]
        groups = []
        while len(remaining) > 2:
            groups.insert(0, remaining[-2:])
            remaining = remaining[:-2]
        if remaining:
            groups.insert(0, remaining)
        formatted = ",".join(groups) + "," + last3

    prefix = f"-{symbol}" if is_negative else symbol
    return f"{prefix}{formatted}"


def get_current_month_str() -> str:
    """Returns the current month in 'YYYY-MM' format."""
    return date.today().strftime("%Y-%m")


def get_month_name(month_str: str) -> str:
    """
    Converts '2026-03' into 'March 2026'.
    """
    try:
        dt = datetime.strptime(month_str, "%Y-%m")
        return dt.strftime("%B %Y")
    except Exception:
        return month_str


def validate_email(email: str) -> bool:
    """Simple regex check for valid email syntax."""
    if not email:
        return False
    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    return bool(re.match(pattern, email.strip()))


def validate_csv_expense_file(df: pd.DataFrame) -> Tuple[bool, Optional[str]]:
    """
    Validates uploaded expense CSV file against mandatory schema:
    Required columns: Date, Category, Description, Amount
    Checks for missing values, valid dates, and positive numbers.
    """
    required_cols = {"Date", "Category", "Description", "Amount"}
    col_map = {c.strip().capitalize(): c for c in df.columns}

    # Case-insensitive column presence check
    missing = [req for req in required_cols if req not in col_map]
    if missing:
        return False, f"Missing required column(s): {', '.join(missing)}. Expected: Date, Category, Description, Amount"

    # Normalize column names
    clean_df = df.rename(columns={col_map[k]: k for k in required_cols})

    if clean_df.empty:
        return False, "Uploaded CSV file contains no data rows."

    # Validate Amount
    try:
        clean_df["Amount"] = pd.to_numeric(clean_df["Amount"], errors="coerce")
    except Exception:
        return False, "Amount column contains invalid non-numeric values."

    if clean_df["Amount"].isnull().any():
        return False, "Amount column contains empty or non-numeric entries."

    if (clean_df["Amount"] <= 0).any():
        return False, "All expense amounts must be positive numbers greater than 0."

    # Validate Date
    try:
        pd.to_datetime(clean_df["Date"], errors="raise")
    except Exception:
        return False, "Date column contains invalid dates. Expected format: YYYY-MM-DD or DD/MM/YYYY."

    return True, None
