"""
FinSight AI — Form Input Components
Modular Streamlit input forms for Expenses, Incomes, Budgets, Goals, and CSV Uploads.
Features real-time client-side validation and friendly feedback.
"""

from datetime import date
from typing import Optional, Callable
import streamlit as st
import pandas as pd
from services.expense_service import (
    EXPENSE_CATEGORIES,
    INCOME_SOURCES,
    add_expense,
    add_income,
    set_budget,
    add_goal
)
from utils.helpers import validate_csv_expense_file, get_current_month_str


def render_add_expense_form(user_id: int, on_success: Optional[Callable] = None):
    """
    Renders modal/inline form to record an expense.
    Supports standard categories + custom category input.
    """
    st.subheader("➕ Record New Expense")
    with st.form("add_expense_form", clear_on_submit=True):
        col1, col2 = st.columns(2)
        with col1:
            exp_date = st.date_input("Date", value=date.today())
            selected_cat = st.selectbox("Category", options=EXPENSE_CATEGORIES + ["+ Custom Category..."])
            custom_cat = ""
            if selected_cat == "+ Custom Category...":
                custom_cat = st.text_input("Enter Custom Category Name", placeholder="e.g. Pet Care, Gaming")

        with col2:
            amount = st.number_input("Amount (₹)", min_value=0.0, step=50.0, format="%.2f")
            description = st.text_input("Description / Note", placeholder="e.g., Dinner with team, Metro recharge")

        submitted = st.form_submit_button("Save Expense", use_container_width=True, type="primary")

        if submitted:
            final_cat = custom_cat.strip() if selected_cat == "+ Custom Category..." else selected_cat
            if amount <= 0:
                st.error("Please enter a valid amount greater than ₹0.")
                return
            if not final_cat:
                st.error("Please specify a category.")
                return

            try:
                add_expense(
                    user_id=user_id,
                    expense_date=exp_date,
                    category=final_cat,
                    description=description,
                    amount=amount
                )
                st.success(f"Expense of ₹{amount:,.2f} recorded in {final_cat} successfully!")
                if on_success:
                    on_success()
            except Exception as e:
                st.error(f"Failed to record expense: {str(e)}")


def render_add_income_form(user_id: int, on_success: Optional[Callable] = None):
    """
    Renders input form to register income inflows.
    """
    st.subheader("💵 Add Income Inflow")
    with st.form("add_income_form", clear_on_submit=True):
        col1, col2 = st.columns(2)
        with col1:
            inc_date = st.date_input("Income Date", value=date.today())
            source = st.selectbox("Income Source", options=INCOME_SOURCES)

        with col2:
            amount = st.number_input("Income Amount (₹)", min_value=0.0, step=500.0, format="%.2f")

        submitted = st.form_submit_button("Record Income", use_container_width=True, type="primary")

        if submitted:
            if amount <= 0:
                st.error("Please enter a positive income amount.")
                return

            try:
                add_income(
                    user_id=user_id,
                    income_date=inc_date,
                    source=source,
                    amount=amount
                )
                st.success(f"Income of ₹{amount:,.2f} from {source} added successfully!")
                if on_success:
                    on_success()
            except Exception as e:
                st.error(f"Failed to record income: {str(e)}")


def render_set_budget_form(user_id: int, current_month: str, on_success: Optional[Callable] = None):
    """
    Allows setting or adjusting category spending budgets.
    """
    st.subheader("🎯 Set Monthly Category Budget")
    with st.form("set_budget_form", clear_on_submit=False):
        col1, col2, col3 = st.columns([1, 1, 1])
        with col1:
            month_val = st.text_input("Month (YYYY-MM)", value=current_month)
        with col2:
            category = st.selectbox("Category", options=EXPENSE_CATEGORIES)
        with col3:
            budget_amount = st.number_input("Monthly Limit (₹)", min_value=100.0, value=5000.0, step=500.0)

        submitted = st.form_submit_button("Apply Budget Limit", use_container_width=True, type="primary")

        if submitted:
            try:
                set_budget(user_id, month=month_val.strip(), category=category, budget_amount=budget_amount)
                st.success(f"Budget for {category} set to ₹{budget_amount:,.2f} for {month_val}.")
                if on_success:
                    on_success()
            except Exception as e:
                st.error(f"Could not save budget: {str(e)}")


def render_add_goal_form(user_id: int, on_success: Optional[Callable] = None):
    """
    Form to establish savings targets (e.g. New Laptop, Vacation).
    """
    st.subheader("🏁 Create Financial Goal")
    with st.form("add_goal_form", clear_on_submit=True):
        col1, col2 = st.columns(2)
        with col1:
            name = st.text_input("Goal Title", placeholder="e.g., New Laptop, Emergency Fund")
            target_amount = st.number_input("Target Amount (₹)", min_value=1000.0, step=1000.0, value=50000.0)
        with col2:
            current_saved = st.number_input("Current Savings Already Allocated (₹)", min_value=0.0, step=500.0, value=0.0)
            deadline = st.date_input("Target Completion Date", value=date.today() + pd.Timedelta(days=180))

        submitted = st.form_submit_button("Save Goal", use_container_width=True, type="primary")

        if submitted:
            if not name.strip():
                st.error("Please enter a name for your financial goal.")
                return
            if target_amount <= 0:
                st.error("Target amount must be greater than zero.")
                return

            try:
                add_goal(user_id, name=name, target_amount=target_amount, current_amount=current_saved, deadline=deadline)
                st.success(f"Goal '{name}' created with target ₹{target_amount:,.2f}!")
                if on_success:
                    on_success()
            except Exception as e:
                st.error(f"Failed to create goal: {str(e)}")


def render_csv_upload_form(user_id: int, on_success: Optional[Callable] = None):
    """
    Renders CSV drag-and-drop import with validation.
    """
    st.markdown("### 📥 Import Expenses from CSV")
    st.caption("Upload a `.csv` with columns: `Date`, `Category`, `Description`, `Amount`")

    uploaded_file = st.file_uploader("Select CSV file", type=["csv"])

    if uploaded_file is not None:
        try:
            df = pd.read_csv(uploaded_file)
            is_valid, err_msg = validate_csv_expense_file(df)
            if not is_valid:
                st.error(f"Validation Failed: {err_msg}")
                return

            st.write(f"Previewing first {min(5, len(df))} entries:")
            st.dataframe(df.head(5), use_container_width=True)

            if st.button("Confirm Import", type="primary"):
                col_map = {c.strip().capitalize(): c for c in df.columns}
                clean_df = df.rename(columns={col_map[k]: k for k in ["Date", "Category", "Description", "Amount"]})

                count = 0
                for _, row in clean_df.iterrows():
                    parsed_date = pd.to_datetime(row["Date"]).date()
                    cat = str(row["Category"]).strip()
                    desc = str(row["Description"]) if pd.notnull(row["Description"]) else ""
                    amt = float(row["Amount"])
                    add_expense(user_id, parsed_date, cat, desc, amt)
                    count += 1

                st.success(f"Successfully imported {count} expense records!")
                if on_success:
                    on_success()

        except Exception as e:
            st.error(f"Error reading CSV file: {str(e)}")
