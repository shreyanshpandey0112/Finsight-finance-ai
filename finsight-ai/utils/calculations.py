"""
FinSight AI — Financial Calculations Utility
Core mathematical and statistical formulas used across dashboard, analytics, and simulators.
Every function includes guard rails for edge conditions (zero income, negative inputs).
"""

from typing import List, Dict, Any


def calculate_total_expenses(expenses: List[Any]) -> float:
    """
    Computes total sum of expenses from a list of Expense objects or dictionaries.
    """
    total = 0.0
    for exp in expenses:
        if isinstance(exp, dict):
            total += float(exp.get("amount", 0.0))
        else:
            total += float(getattr(exp, "amount", 0.0))
    return round(total, 2)


def calculate_total_income(incomes: List[Any]) -> float:
    """
    Computes total sum of income from a list of Income objects or dictionaries.
    """
    total = 0.0
    for inc in incomes:
        if isinstance(inc, dict):
            total += float(inc.get("amount", 0.0))
        else:
            total += float(getattr(inc, "amount", 0.0))
    return round(total, 2)


def calculate_savings(income: float, expenses: float) -> float:
    """
    Savings = Income - Expenses.
    Can be negative if user is in a monthly deficit.
    """
    return round(income - expenses, 2)


def calculate_savings_rate(income: float, expenses: float) -> float:
    """
    Savings Rate = (Savings / Income) * 100.
    Handles zero or negative income safely by returning 0.0%.
    """
    if income <= 0:
        return 0.0
    savings = income - expenses
    rate = (savings / income) * 100.0
    return round(rate, 1)


def calculate_category_spending(expenses: List[Any]) -> Dict[str, float]:
    """
    Aggregates spending by category into a sorted dictionary (highest to lowest).
    """
    category_totals: Dict[str, float] = {}
    for exp in expenses:
        cat = exp.get("category", "Other") if isinstance(exp, dict) else getattr(exp, "category", "Other")
        amt = float(exp.get("amount", 0.0) if isinstance(exp, dict) else getattr(exp, "amount", 0.0))
        category_totals[cat] = category_totals.get(cat, 0.0) + amt

    # Sort descending by spent amount
    return dict(sorted(category_totals.items(), key=lambda item: item[1], reverse=True))


def calculate_budget_usage(spent: float, budget: float) -> Dict[str, Any]:
    """
    Calculates percentage utilization and threshold status for a category budget.
    Returns percentage, warning status ('normal', 'warning_80', 'exceeded'), and difference.
    """
    if budget <= 0:
        percentage = 100.0 if spent > 0 else 0.0
        return {
            "spent": spent,
            "budget": budget,
            "percentage": percentage,
            "remaining": 0.0,
            "status": "exceeded" if spent > 0 else "normal",
            "over_by": spent
        }

    percentage = round((spent / budget) * 100.0, 1)
    remaining = round(budget - spent, 2)

    if spent > budget:
        status = "exceeded"
        over_by = round(spent - budget, 2)
    elif percentage >= 80.0:
        status = "warning_80"
        over_by = 0.0
    else:
        status = "normal"
        over_by = 0.0

    return {
        "spent": round(spent, 2),
        "budget": round(budget, 2),
        "percentage": percentage,
        "remaining": remaining,
        "status": status,
        "over_by": over_by
    }


def calculate_future_value(
    principal: float,
    monthly_contribution: float,
    annual_rate_percent: float,
    years: int
) -> Dict[str, Any]:
    """
    Calculates compound wealth growth using the standard Future Value formula:
    FV = P * (1 + r)^n + PMT * [((1 + r)^n - 1) / r]
    
    where:
      P   = Starting principal
      PMT = Monthly contribution
      r   = Monthly return rate (annual_rate_percent / 100 / 12)
      n   = Total months (years * 12)
    """
    months = max(1, years * 12)
    total_contributions = principal + (monthly_contribution * months)

    # Edge case: zero return rate (pure cash stash with no interest)
    if annual_rate_percent <= 0:
        fv = total_contributions
        yearly_breakdown = []
        for y in range(1, years + 1):
            m = y * 12
            c = principal + (monthly_contribution * m)
            yearly_breakdown.append({
                "year": y,
                "contributed": round(c, 2),
                "interest": 0.0,
                "balance": round(c, 2)
            })
        return {
            "future_value": round(fv, 2),
            "total_contributions": round(total_contributions, 2),
            "total_growth": 0.0,
            "yearly_breakdown": yearly_breakdown
        }

    monthly_rate = (annual_rate_percent / 100.0) / 12.0
    growth_factor = (1.0 + monthly_rate) ** months
    
    # Lump-sum compound component: P * (1 + r)^n
    lump_sum_part = principal * growth_factor
    
    # Annuity series compound component: PMT * [((1 + r)^n - 1) / r]
    annuity_part = monthly_contribution * ((growth_factor - 1.0) / monthly_rate)
    
    future_value = lump_sum_part + annuity_part
    total_growth = future_value - total_contributions

    # Year-by-year trajectory for charts
    yearly_breakdown = []
    for y in range(1, years + 1):
        m = y * 12
        gf = (1.0 + monthly_rate) ** m
        bal = (principal * gf) + (monthly_contribution * ((gf - 1.0) / monthly_rate))
        contrib = principal + (monthly_contribution * m)
        yearly_breakdown.append({
            "year": y,
            "contributed": round(contrib, 2),
            "interest": round(max(0.0, bal - contrib), 2),
            "balance": round(bal, 2)
        })

    return {
        "future_value": round(future_value, 2),
        "total_contributions": round(total_contributions, 2),
        "total_growth": round(max(0.0, total_growth), 2),
        "yearly_breakdown": yearly_breakdown
    }
