"""
FinSight AI — Main Dashboard View Component
Assembles top KPI metrics, budget alerts, category breakdowns, and AI predictions.
"""

from typing import Dict, Any, List
import streamlit as st
from utils.helpers import format_inr, get_month_name
from utils.calculations import calculate_budget_usage
from components.charts import (
    render_category_donut,
    render_monthly_expense_trend,
    render_income_vs_expense
)


def render_kpi_cards(kpis: Dict[str, Any]):
    """
    Renders 4 top-level KPI metric cards with Indian Rupee formatting and delta comparisons.
    """
    col1, col2, col3, col4 = st.columns(4)

    with col1:
        inc_delta = f"{kpis['income_change_pct']:+.1f}% vs last mo" if kpis['prev_income'] > 0 else None
        st.metric(
            label="Monthly Income",
            value=format_inr(kpis["income"]),
            delta=inc_delta
        )

    with col2:
        exp_delta = f"{kpis['expense_change_pct']:+.1f}% vs last mo" if kpis['prev_expense'] > 0 else None
        # Invert delta color logic: lower expenses is green
        st.metric(
            label="Total Expenses",
            value=format_inr(kpis["expenses"]),
            delta=exp_delta,
            delta_color="inverse"
        )

    with col3:
        st.metric(
            label="Remaining Balance",
            value=format_inr(kpis["savings"]),
            delta="Surplus" if kpis["savings"] >= 0 else "Deficit"
        )

    with col4:
        st.metric(
            label="Savings Rate",
            value=f"{kpis['savings_rate']:.1f}%",
            delta="Healthy" if kpis['savings_rate'] >= 20.0 else "Action Recommended"
        )


def render_budget_progress_section(curr_expenses: List[Dict[str, Any]], budgets: List[Dict[str, Any]]):
    """
    Displays category budget meters and triggers clear, friendly warnings at 80% and 100%+ thresholds.
    """
    st.subheader("🎯 Budget Utilization")
    if not budgets:
        st.info("No budgets configured for this month. Set spending limits under the 'Budgets' tab.")
        return

    # Aggregate spent per category
    spent_by_cat = {}
    for exp in curr_expenses:
        cat = exp["category"]
        spent_by_cat[cat] = spent_by_cat.get(cat, 0.0) + float(exp["amount"])

    for b in budgets:
        cat = b["category"]
        budget_amt = b["amount"]
        spent = spent_by_cat.get(cat, 0.0)
        usage = calculate_budget_usage(spent, budget_amt)

        # Warning messages
        if usage["status"] == "exceeded":
            st.warning(f"⚠ **{cat}** budget exceeded by {format_inr(usage['over_by'])}! ({format_inr(spent)} / {format_inr(budget_amt)})")
        elif usage["status"] == "warning_80":
            st.info(f"⚠ You have used {usage['percentage']:.0f}% of your **{cat}** budget ({format_inr(spent)} / {format_inr(budget_amt)}).")

        # Progress bar clamped to 1.0 for Streamlit UI
        prog_val = min(1.0, max(0.0, usage["percentage"] / 100.0))
        col_label, col_bar = st.columns([1, 3])
        with col_label:
            st.markdown(f"**{cat}**")
            st.caption(f"{format_inr(spent)} / {format_inr(budget_amt)} ({usage['percentage']:.1f}%)")
        with col_bar:
            st.progress(prog_val)


def render_smart_insights_card(insights: List[Dict[str, str]]):
    """
    Renders clean insight badges derived from real user data.
    """
    st.subheader("💡 Smart Spending Insights")
    cols = st.columns(min(len(insights), 3) if insights else 1)
    for idx, ins in enumerate(insights[:3]):
        with cols[idx % len(cols)]:
            st.markdown(
                f"""
                <div style="background-color: rgba(30, 41, 59, 0.6); padding: 14px; border-radius: 10px; border-left: 4px solid #10b981; margin-bottom: 10px;">
                    <span style="font-size: 1.2rem;">{ins['icon']}</span>
                    <p style="margin-top: 6px; font-size: 0.92rem; color: #e2e8f0; line-height: 1.4;">{ins['text']}</p>
                </div>
                """,
                unsafe_allow_html=True
            )
