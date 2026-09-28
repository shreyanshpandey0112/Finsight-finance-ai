"""
FinSight AI — Financial Analytics Service
Aggregates time-series metrics, category breakdowns, and generates 100% factual, data-driven insights.
"""

from typing import List, Dict, Any, Tuple
from collections import defaultdict
from datetime import datetime, date
from utils.calculations import (
    calculate_total_expenses,
    calculate_total_income,
    calculate_savings,
    calculate_savings_rate,
    calculate_category_spending,
    calculate_budget_usage
)


def get_monthly_aggregates(
    expenses: List[Dict[str, Any]],
    incomes: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Groups expenses and incomes by month ('YYYY-MM') in ascending chronological order.
    Calculates net savings and savings rate per month.
    """
    month_data = defaultdict(lambda: {"expense": 0.0, "income": 0.0})

    for exp in expenses:
        m = exp["date"][:7]
        month_data[m]["expense"] += float(exp["amount"])

    for inc in incomes:
        m = inc["date"][:7]
        month_data[m]["income"] += float(inc["amount"])

    sorted_months = sorted(month_data.keys())
    results = []
    for m in sorted_months:
        exp_amt = round(month_data[m]["expense"], 2)
        inc_amt = round(month_data[m]["income"], 2)
        sav = calculate_savings(inc_amt, exp_amt)
        rate = calculate_savings_rate(inc_amt, exp_amt)
        results.append({
            "month": m,
            "expense": exp_amt,
            "income": inc_amt,
            "savings": sav,
            "savings_rate": rate
        })

    return results


def get_current_month_kpis(
    expenses: List[Dict[str, Any]],
    incomes: List[Dict[str, Any]],
    current_month_str: str
) -> Dict[str, Any]:
    """
    Computes top-level KPI cards for the selected/current month:
      - Monthly Income
      - Total Expenses
      - Remaining Balance
      - Savings Rate
      - Comparisons with previous month
      - Largest spending category
    """
    # Filter for target month
    curr_expenses = [e for e in expenses if e["date"].startswith(current_month_str)]
    curr_incomes = [i for i in incomes if i["date"].startswith(current_month_str)]

    tot_income = calculate_total_income(curr_incomes)
    tot_expense = calculate_total_expenses(curr_expenses)
    savings = calculate_savings(tot_income, tot_expense)
    savings_rate = calculate_savings_rate(tot_income, tot_expense)

    # Previous month derivation
    dt = datetime.strptime(current_month_str, "%Y-%m")
    first_day = date(dt.year, dt.month, 1)
    prev_dt = first_day.replace(day=1) - datetime.resolution
    prev_month_str = prev_dt.strftime("%Y-%m")

    prev_expenses = [e for e in expenses if e["date"].startswith(prev_month_str)]
    prev_incomes = [i for i in incomes if i["date"].startswith(prev_month_str)]
    prev_income = calculate_total_income(prev_incomes)
    prev_expense = calculate_total_expenses(prev_expenses)

    # Percentage changes
    exp_change_pct = 0.0
    if prev_expense > 0:
        exp_change_pct = round(((tot_expense - prev_expense) / prev_expense) * 100.0, 1)

    inc_change_pct = 0.0
    if prev_income > 0:
        inc_change_pct = round(((tot_income - prev_income) / prev_income) * 100.0, 1)

    # Category breakdown
    cat_spending = calculate_category_spending(curr_expenses)
    largest_cat = list(cat_spending.keys())[0] if cat_spending else "None"
    largest_cat_amt = list(cat_spending.values())[0] if cat_spending else 0.0

    return {
        "month": current_month_str,
        "income": tot_income,
        "expenses": tot_expense,
        "savings": savings,
        "savings_rate": savings_rate,
        "prev_income": prev_income,
        "prev_expense": prev_expense,
        "expense_change_pct": exp_change_pct,
        "income_change_pct": inc_change_pct,
        "largest_category": largest_cat,
        "largest_category_amount": largest_cat_amt,
        "category_breakdown": cat_spending
    }


def generate_smart_insights(
    expenses: List[Dict[str, Any]],
    incomes: List[Dict[str, Any]],
    budgets: List[Dict[str, Any]],
    current_month_str: str
) -> List[Dict[str, str]]:
    """
    Generates verified factual, rule-based insights based strictly on user records.
    Does not invent statistics or hallucinations.
    """
    insights = []

    # Filter current and previous months
    curr_expenses = [e for e in expenses if e["date"].startswith(current_month_str)]
    curr_incomes = [i for i in incomes if i["date"].startswith(current_month_str)]

    dt = datetime.strptime(current_month_str, "%Y-%m")
    prev_dt = date(dt.year, dt.month, 1) - datetime.resolution
    prev_month_str = prev_dt.strftime("%Y-%m")
    prev_expenses = [e for e in expenses if e["date"].startswith(prev_month_str)]
    prev_incomes = [i for i in incomes if i["date"].startswith(prev_month_str)]

    curr_exp_total = calculate_total_expenses(curr_expenses)
    prev_exp_total = calculate_total_expenses(prev_expenses)
    curr_inc_total = calculate_total_income(curr_incomes)
    prev_inc_total = calculate_total_income(prev_incomes)

    curr_cats = calculate_category_spending(curr_expenses)
    prev_cats = calculate_category_spending(prev_expenses)

    # 1. Category shift insight
    for cat, amt in curr_cats.items():
        prev_amt = prev_cats.get(cat, 0.0)
        if prev_amt > 0:
            pct = round(((amt - prev_amt) / prev_amt) * 100.0, 1)
            if abs(pct) >= 10.0:
                direction = "increased" if pct > 0 else "decreased"
                insights.append({
                    "type": "category_trend",
                    "icon": "📈" if pct > 0 else "📉",
                    "text": f"Your {cat} spending {direction} by {abs(pct)}% compared with last month."
                })
                break

    # 2. Ranking insight
    cat_items = list(curr_cats.items())
    if len(cat_items) >= 3:
        third_cat = cat_items[2][0]
        insights.append({
            "type": "ranking",
            "icon": "🏷️",
            "text": f"{third_cat} is currently your third-largest spending category."
        })

    # 3. Overall budget utilization
    if budgets:
        total_budgeted = sum(b.get("amount", 0.0) for b in budgets)
        if total_budgeted > 0:
            usage_pct = round((curr_exp_total / total_budgeted) * 100.0, 1)
            insights.append({
                "type": "budget",
                "icon": "🎯",
                "text": f"You have utilized {usage_pct}% of your total allocated monthly budget."
            })

    # 4. Savings rate trend
    curr_sr = calculate_savings_rate(curr_inc_total, curr_exp_total)
    prev_sr = calculate_savings_rate(prev_inc_total, prev_exp_total)
    if prev_inc_total > 0 and curr_inc_total > 0:
        if curr_sr > prev_sr:
            insights.append({
                "type": "savings",
                "icon": "💰",
                "text": f"Your savings rate increased from {prev_sr}% last month to {curr_sr}% this month."
            })
        elif curr_sr < prev_sr:
            insights.append({
                "type": "savings",
                "icon": "💡",
                "text": f"Your savings rate decreased from {prev_sr}% to {curr_sr}%. Check discretionary outlays."
            })

    # Fallback if brand new data
    if not insights:
        insights.append({
            "type": "welcome",
            "icon": "✨",
            "text": "Add a few more transactions across categories to unlock automated financial insights."
        })

    return insights
