"""
FinSight AI — Personal Finance & Expense Predictor
Main Streamlit Application Entrypoint.
A modern, modular personal finance dashboard built for BCA projects and startup-level standards.
"""

import os
import io
from datetime import datetime, date
import pandas as pd
import streamlit as st

# 1. Page Configuration (must be very first Streamlit call)
st.set_page_config(
    page_title="FinSight AI — Personal Finance & Expense Predictor",
    page_icon="💳",
    layout="wide",
    initial_sidebar_state="expanded"
)

# 2. Database & Module Imports
from database.database import init_db
from database.models import User
from auth.authentication import register_user, authenticate_user
from services.expense_service import (
    EXPENSE_CATEGORIES,
    INCOME_SOURCES,
    add_expense,
    delete_expense,
    get_user_expenses,
    add_income,
    delete_income,
    get_user_incomes,
    set_budget,
    get_budgets,
    add_goal,
    get_goals,
    update_goal_progress,
    delete_goal,
    seed_demo_data,
    clear_user_data
)
from services.analytics_service import (
    get_monthly_aggregates,
    get_current_month_kpis,
    generate_smart_insights
)
from services.investment_service import compare_investment_vs_cash
from ml.expense_predictor import predict_next_month_expenses
from utils.helpers import format_inr, get_current_month_str, get_month_name
from utils.calculations import calculate_budget_usage
from components.charts import (
    render_category_donut,
    render_monthly_expense_trend,
    render_income_vs_expense,
    render_category_bar,
    render_savings_trend,
    render_wealth_projection,
    render_ml_trend_chart
)
from components.forms import (
    render_add_expense_form,
    render_add_income_form,
    render_set_budget_form,
    render_add_goal_form,
    render_csv_upload_form
)

# Initialize SQLite database tables automatically
init_db()

# 3. Custom CSS for Startup-Grade Aesthetic
st.markdown("""
<style>
    /* Clean modern typography and cards */
    .stApp {
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    
    /* Metrics styling */
    [data-testid="stMetricValue"] {
        font-size: 1.85rem !important;
        font-weight: 700 !important;
    }
    
    /* Rounded card containers */
    .dashboard-card {
        background-color: rgba(30, 41, 59, 0.4);
        border: 1px solid rgba(148, 163, 184, 0.15);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
    }
    
    /* Custom button aesthetics */
    .stButton>button {
        border-radius: 8px;
        font-weight: 600;
        transition: all 0.2s ease;
    }
    
    /* Subtle hero banner */
    .hero-banner {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%);
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-radius: 14px;
        padding: 28px;
        margin-bottom: 24px;
    }
    
    /* Warning badges */
    .budget-warning {
        background: rgba(245, 158, 11, 0.12);
        border-left: 4px solid #f59e0b;
        padding: 10px 14px;
        border-radius: 6px;
        margin-bottom: 8px;
    }
    
    .budget-exceeded {
        background: rgba(244, 63, 94, 0.12);
        border-left: 4px solid #f43f5e;
        padding: 10px 14px;
        border-radius: 6px;
        margin-bottom: 8px;
    }
</style>
""", unsafe_allow_html=True)


# 4. Session State Management
if "user" not in st.session_state:
    st.session_state.user = None

if "currency_symbol" not in st.session_state:
    st.session_state.currency_symbol = "₹"

if "selected_month" not in st.session_state:
    st.session_state.selected_month = get_current_month_str()


# 5. Helper to trigger UI rerun safely
def trigger_rerun():
    st.rerun()


# ==========================================
# PUBLIC / AUTHENTICATION LANDING SCREEN
# ==========================================
if not st.session_state.user:
    st.markdown("""
    <div class="hero-banner">
        <h1 style="margin: 0; font-size: 2.6rem; font-weight: 800; color: #10b981;">FinSight AI</h1>
        <p style="font-size: 1.25rem; font-weight: 600; color: #94a3b8; margin-top: 6px;">Track. Understand. Predict.</p>
        <p style="font-size: 1.05rem; color: #cbd5e1; max-width: 650px; line-height: 1.5; margin-top: 12px;">
            Your personal finance dashboard powered by Scikit-learn Machine Learning. 
            Forecast next month's spending, monitor budget limits, and simulate long-term compound wealth growth.
        </p>
    </div>
    """, unsafe_allow_html=True)

    # Feature preview cards
    c1, c2, c3 = st.columns(3)
    with c1:
        st.markdown("""
        **📊 Expense Analytics**  
        Interactive Plotly donut charts, monthly trends, and spending breakdowns.
        """)
        st.markdown("""
        **🎯 Budget Tracking**  
        Real-time spending meters with automated 80% threshold warnings.
        """)
    with c2:
        st.markdown("""
        **🤖 AI Expense Forecast**  
        Linear Regression time-series forecasting with dynamic overspending alerts.
        """)
        st.markdown("""
        **💰 Wealth Simulator**  
        Compound interest projections with Cash vs Investment comparisons.
        """)
    with c3:
        st.markdown("""
        **🏁 Financial Goals**  
        Track milestones like laptop purchases, vacation funds, or emergency reserves.
        """)
        st.markdown("""
        **📁 Data Import & Export**  
        Seamless CSV uploads with full data validation and one-click data downloads.
        """)

    st.divider()

    auth_tab1, auth_tab2, auth_tab3 = st.tabs(["🔑 Sign In", "📝 Create Account", "🚀 Try Demo Mode"])

    with auth_tab1:
        st.subheader("Login to Your Dashboard")
        with st.form("login_form"):
            login_email = st.text_input("Email Address", placeholder="e.g., student@example.com")
            login_password = st.text_input("Password", type="password")
            btn_login = st.form_submit_button("Sign In", type="primary", use_container_width=True)

            if btn_login:
                user_data, msg = authenticate_user(login_email, login_password)
                if user_data:
                    st.session_state.user = user_data
                    st.success("Welcome back! Loading your dashboard...")
                    trigger_rerun()
                else:
                    st.error(msg)

    with auth_tab2:
        st.subheader("Register a New FinSight Account")
        with st.form("register_form"):
            reg_name = st.text_input("Full Name", placeholder="e.g., Shreyansh Pandey")
            reg_email = st.text_input("Email", placeholder="e.g., shreyansh@example.com")
            reg_pwd = st.text_input("Password (min 6 characters)", type="password")
            reg_confirm = st.text_input("Confirm Password", type="password")
            btn_reg = st.form_submit_button("Create My Account", type="primary", use_container_width=True)

            if btn_reg:
                success, msg = register_user(reg_name, reg_email, reg_pwd, reg_confirm)
                if success:
                    st.success(msg)
                    st.info("Switch to the 'Sign In' tab to log in with your new credentials.")
                else:
                    st.error(msg)

    with auth_tab3:
        st.subheader("Instant Demo Experience")
        st.write(
            "Explore all features immediately with 14 months of synthetic financial data, "
            "budgets, and goals pre-loaded. No account creation required."
        )
        if st.button("Load Demo Account & Data", type="primary", use_container_width=True):
            # Check or create demo user
            from database.database import get_db
            with get_db() as db:
                demo_user = db.query(User).filter(User.email == "demo@finsight.ai").first()
                if not demo_user:
                    register_user("Demo Explorer", "demo@finsight.ai", "demo1234", "demo1234")
                    demo_user = db.query(User).filter(User.email == "demo@finsight.ai").first()

            user_payload = {
                "id": demo_user.id,
                "name": demo_user.name,
                "email": demo_user.email,
                "created_at": str(demo_user.created_at)
            }
            # Seed 14 months
            seed_demo_data(demo_user.id, months_count=14)
            st.session_state.user = user_payload
            st.success("Demo environment initialized! Launching dashboard...")
            trigger_rerun()

    st.stop()


# ==========================================
# AUTHENTICATED APPLICATION
# ==========================================
current_user = st.session_state.user
user_id = current_user["id"]
user_name = current_user["name"]

# Fetch user's financial dataset
all_expenses = get_user_expenses(user_id)
all_incomes = get_user_incomes(user_id)
all_goals = get_goals(user_id)
monthly_aggregates = get_monthly_aggregates(all_expenses, all_incomes)

# Available month keys for selectors
month_options = [m["month"] for m in monthly_aggregates]
if not month_options:
    month_options = [get_current_month_str()]

if st.session_state.selected_month not in month_options:
    st.session_state.selected_month = month_options[-1]


# ------------------------------------------
# SIDEBAR NAVIGATION
# ------------------------------------------
with st.sidebar:
    st.markdown(f"### 💳 FinSight AI")
    st.markdown(f"Welcome back, **{user_name}** 👋")
    st.caption(f"Account: `{current_user['email']}`")

    st.divider()

    nav_selection = st.radio(
        "Navigation",
        options=[
            "📊 Dashboard",
            "💳 Transactions",
            "➕ Add Expense",
            "💵 Add Income",
            "📈 Expense Analytics",
            "🎯 Budgets",
            "🤖 AI Forecast",
            "💰 Wealth Simulator",
            "🏁 Financial Goals",
            "📁 Import / Export",
            "🧠 About AI & Viva Guide",
            "⚙ Settings"
        ],
        index=0
    )

    st.divider()
    if st.button("🚪 Logout", use_container_width=True):
        st.session_state.user = None
        st.rerun()


# ==========================================
# 1. MAIN DASHBOARD PAGE
# ==========================================
if nav_selection == "📊 Dashboard":
    st.title("📊 Financial Dashboard")
    
    # Month selector banner
    col_title, col_month = st.columns([3, 1])
    with col_month:
        selected_m = st.selectbox(
            "Viewing Period",
            options=month_options,
            index=month_options.index(st.session_state.selected_month)
        )
        st.session_state.selected_month = selected_m

    # KPI Calculation
    kpis = get_current_month_kpis(all_expenses, all_incomes, selected_m)
    curr_month_budgets = get_budgets(user_id, selected_m)

    # 1. Top-level KPI cards
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        inc_delta = f"{kpis['income_change_pct']:+.1f}% vs last mo" if kpis['prev_income'] > 0 else None
        st.metric("Monthly Income", format_inr(kpis["income"]), delta=inc_delta)
    with col2:
        exp_delta = f"{kpis['expense_change_pct']:+.1f}% vs last mo" if kpis['prev_expense'] > 0 else None
        st.metric("Total Expenses", format_inr(kpis["expenses"]), delta=exp_delta, delta_color="inverse")
    with col3:
        st.metric("Remaining Balance", format_inr(kpis["savings"]), delta="Surplus" if kpis["savings"] >= 0 else "Deficit")
    with col4:
        st.metric("Savings Rate", f"{kpis['savings_rate']:.1f}%", delta="Target: 20%+")

    st.divider()

    # 2. Smart Insights
    insights = generate_smart_insights(all_expenses, all_incomes, curr_month_budgets, selected_m)
    if insights:
        st.subheader("💡 Smart Spending Insights")
        ins_cols = st.columns(min(len(insights), 3))
        for idx, ins in enumerate(insights[:3]):
            with ins_cols[idx]:
                st.info(f"{ins['icon']} {ins['text']}")

    # 3. Middle Section: Expense Trend & Category Breakdown
    c_trend, c_cat = st.columns([3, 2])
    with c_trend:
        st.subheader("📈 Monthly Expense Trend")
        st.plotly_chart(render_monthly_expense_trend(monthly_aggregates), use_container_width=True)
    with c_cat:
        st.subheader(f"🏷️ Spending Breakdown ({get_month_name(selected_m)})")
        st.plotly_chart(render_category_donut(kpis["category_breakdown"]), use_container_width=True)

    # 4. Budget Status & AI Forecast Preview
    c_budget, c_ai = st.columns([3, 2])
    with c_budget:
        st.subheader(f"🎯 Budget Utilization ({get_month_name(selected_m)})")
        curr_expenses = [e for e in all_expenses if e["date"].startswith(selected_m)]
        if not curr_month_budgets:
            st.info(f"No budgets set for {get_month_name(selected_m)}. Set them in the Budgets tab.")
        else:
            spent_map = {}
            for e in curr_expenses:
                spent_map[e["category"]] = spent_map.get(e["category"], 0.0) + float(e["amount"])
            
            for b in curr_month_budgets:
                spent = spent_map.get(b["category"], 0.0)
                usage = calculate_budget_usage(spent, b["amount"])
                if usage["status"] == "exceeded":
                    st.error(f"⚠ **{b['category']}** budget exceeded by {format_inr(usage['over_by'])}! ({format_inr(spent)} / {format_inr(b['amount'])})")
                elif usage["status"] == "warning_80":
                    st.warning(f"⚠ You have used {usage['percentage']:.0f}% of your **{b['category']}** budget.")
                
                bar_pct = min(1.0, max(0.0, usage["percentage"] / 100.0))
                st.write(f"**{b['category']}**: {format_inr(spent)} of {format_inr(b['amount'])} ({usage['percentage']:.1f}%)")
                st.progress(bar_pct)

    with c_ai:
        st.subheader("🤖 AI Expense Forecast Preview")
        ml_result = predict_next_month_expenses(monthly_aggregates, current_expected_income=kpis["income"])
        if ml_result["status"] == "insufficient_data":
            st.info("ℹ️ " + ml_result["message"])
        else:
            st.metric(
                "Predicted Next Month Expenses",
                format_inr(ml_result["predicted_expense"]),
                delta=f"{ml_result['percentage_change']:+.1f}% vs last month",
                delta_color="inverse"
            )
            st.caption(f"Trend: {ml_result['explanation']}")
            if ml_result["overspending_warning"]:
                st.warning(ml_result["overspending_message"])
            else:
                st.success(ml_result["overspending_message"])
            st.caption("✨ AI forecast — estimate based on your historical spending data.")


# ==========================================
# 2. TRANSACTIONS & HISTORY
# ==========================================
elif nav_selection == "💳 Transactions":
    st.title("💳 Transaction History")
    st.caption("Search, filter, manage, and export your recorded expenses and income streams.")

    tab_exp, tab_inc = st.tabs(["💸 Expenses", "💵 Income"])

    with tab_exp:
        # Filter Bar
        f_col1, f_col2, f_col3, f_col4 = st.columns([2, 1, 1, 1])
        with f_col1:
            search_query = st.text_input("🔍 Search description or category", "")
        with f_col2:
            cat_filter = st.selectbox("Category", ["All"] + EXPENSE_CATEGORIES)
        with f_col3:
            min_a = st.number_input("Min Amount (₹)", min_value=0.0, value=0.0, step=100.0)
        with f_col4:
            max_a = st.number_input("Max Amount (₹)", min_value=0.0, value=0.0, step=500.0)

        max_filter = max_a if max_a > 0 else None
        filtered_expenses = get_user_expenses(
            user_id=user_id,
            category=cat_filter if cat_filter != "All" else None,
            min_amount=min_a if min_a > 0 else None,
            max_amount=max_filter,
            search_query=search_query if search_query else None
        )

        st.write(f"Showing **{len(filtered_expenses)}** expense transactions:")
        if filtered_expenses:
            df_exp = pd.DataFrame(filtered_expenses)
            # Display table
            st.dataframe(
                df_exp[["date", "category", "description", "amount"]].rename(
                    columns={"date": "Date", "category": "Category", "description": "Description", "amount": "Amount (₹)"}
                ),
                use_container_width=True
            )

            # Delete transaction
            del_id = st.selectbox("Select Expense ID to remove:", options=[e["id"] for e in filtered_expenses], format_func=lambda x: f"ID #{x} - {next((e['description'] or e['category']) for e in filtered_expenses if e['id'] == x)}")
            if st.button("🗑️ Delete Selected Expense", type="secondary"):
                if delete_expense(user_id, del_id):
                    st.success("Expense transaction deleted.")
                    trigger_rerun()

            # CSV Export
            csv_data = df_exp[["date", "category", "description", "amount"]].to_csv(index=False)
            st.download_button(
                label="📥 Export Expenses to CSV",
                data=csv_data,
                file_name=f"finsight_expenses_{date.today().strftime('%Y%m%d')}.csv",
                mime="text/csv"
            )
        else:
            st.info("No expense transactions matched your search criteria.")

    with tab_inc:
        st.write(f"Showing **{len(all_incomes)}** income records:")
        if all_incomes:
            df_inc = pd.DataFrame(all_incomes)
            st.dataframe(
                df_inc[["date", "source", "amount"]].rename(
                    columns={"date": "Date", "source": "Source", "amount": "Amount (₹)"}
                ),
                use_container_width=True
            )
            del_inc_id = st.selectbox("Select Income ID to remove:", options=[i["id"] for i in all_incomes], format_func=lambda x: f"ID #{x} - {next(i['source'] for i in all_incomes if i['id']==x)}")
            if st.button("🗑️ Delete Selected Income"):
                if delete_income(user_id, del_inc_id):
                    st.success("Income transaction removed.")
                    trigger_rerun()
        else:
            st.info("No income records found. Add some in the 'Add Income' tab.")


# ==========================================
# 3. ADD EXPENSE
# ==========================================
elif nav_selection == "➕ Add Expense":
    st.title("➕ Add Expense Transaction")
    render_add_expense_form(user_id=user_id, on_success=trigger_rerun)


# ==========================================
# 4. ADD INCOME
# ==========================================
elif nav_selection == "💵 Add Income":
    st.title("💵 Add Income Inflow")
    render_add_income_form(user_id=user_id, on_success=trigger_rerun)


# ==========================================
# 5. EXPENSE ANALYTICS
# ==========================================
elif nav_selection == "📈 Expense Analytics":
    st.title("📈 Deep Financial Analytics")
    st.caption("Interactive multi-dimensional visualization of historical spending and saving habits.")

    # Filter Bar
    col_m, col_c = st.columns([1, 1])
    with col_m:
        analytics_month = st.selectbox("Target Month Breakdown", options=["All Months Combined"] + month_options)
    with col_c:
        analytics_cat = st.selectbox("Filter Category", ["All Categories"] + EXPENSE_CATEGORIES)

    # Filter data
    target_expenses = all_expenses
    if analytics_month != "All Months Combined":
        target_expenses = [e for e in target_expenses if e["date"].startswith(analytics_month)]
    if analytics_cat != "All Categories":
        target_expenses = [e for e in target_expenses if e["category"] == analytics_cat]

    row1_c1, row1_c2 = st.columns(2)
    with row1_c1:
        st.subheader("Category Distribution (Interactive Donut)")
        from utils.calculations import calculate_category_spending
        cat_data = calculate_category_spending(target_expenses)
        st.plotly_chart(render_category_donut(cat_data), use_container_width=True)
    with row1_c2:
        st.subheader("Category Spend Ranking")
        st.plotly_chart(render_category_bar(cat_data), use_container_width=True)

    st.divider()

    row2_c1, row2_c2 = st.columns(2)
    with row2_c1:
        st.subheader("Income vs Expenses Comparison")
        st.plotly_chart(render_income_vs_expense(monthly_aggregates), use_container_width=True)
    with row2_c2:
        st.subheader("Monthly Savings Rate Trend (%)")
        st.plotly_chart(render_savings_trend(monthly_aggregates), use_container_width=True)


# ==========================================
# 6. BUDGETS
# ==========================================
elif nav_selection == "🎯 Budgets":
    st.title("🎯 Monthly Budgets")
    st.caption("Allocate spending limits to keep spending under control with real-time alerts.")

    sel_m = st.selectbox("Select Month to Configure Budgets", options=month_options)
    render_set_budget_form(user_id=user_id, current_month=sel_m, on_success=trigger_rerun)

    st.divider()
    st.subheader(f"Active Budgets for {get_month_name(sel_m)}")
    active_budgets = get_budgets(user_id, sel_m)
    curr_expenses = [e for e in all_expenses if e["date"].startswith(sel_m)]

    if not active_budgets:
        st.info("No budgets established yet for this month.")
    else:
        spent_map = {}
        for e in curr_expenses:
            spent_map[e["category"]] = spent_map.get(e["category"], 0.0) + float(e["amount"])

        for b in active_budgets:
            spent = spent_map.get(b["category"], 0.0)
            usage = calculate_budget_usage(spent, b["amount"])
            
            c_info, c_meter = st.columns([1, 2])
            with c_info:
                st.markdown(f"### {b['category']}")
                st.write(f"Spent: **{format_inr(spent)}** of {format_inr(b['amount'])} ({usage['percentage']:.1f}%)")
                if usage["status"] == "exceeded":
                    st.error(f"⚠ Budget exceeded by {format_inr(usage['over_by'])}")
                elif usage["status"] == "warning_80":
                    st.warning("⚠ 80% threshold reached")
                else:
                    st.success("Within budget")
            with c_meter:
                st.progress(min(1.0, max(0.0, usage["percentage"] / 100.0)))
            st.write("---")


# ==========================================
# 7. AI EXPENSE FORECAST
# ==========================================
elif nav_selection == "🤖 AI Forecast":
    st.title("🤖 AI Expense Predictor")
    st.caption("Next-month expenditure forecasting powered by Scikit-learn Linear Regression.")

    # Expected income input for overspending calculation
    latest_kpi = get_current_month_kpis(all_expenses, all_incomes, month_options[-1])
    default_income = latest_kpi["income"] if latest_kpi["income"] > 0 else 50000.0
    expected_inc = st.number_input("Expected Next Month Income (₹)", min_value=1000.0, value=float(default_income), step=1000.0)

    ml_result = predict_next_month_expenses(monthly_aggregates, current_expected_income=expected_inc)

    if ml_result["status"] == "insufficient_data":
        st.warning(f"⚠ {ml_result['message']}")
        st.info(f"Current history: **{ml_result['current_months']}** months. Required: at least **{ml_result['min_required']}** months.")
        st.write("💡 *Tip: Load the Demo Account in Settings or Add more historical transactions to train the model.*")
    else:
        # Top Prediction KPI Card
        kpi_col1, kpi_col2, kpi_col3 = st.columns(3)
        with kpi_col1:
            st.metric(
                "Predicted Next Month Expenses",
                format_inr(ml_result["predicted_expense"]),
                delta=f"{ml_result['percentage_change']:+.1f}% vs last month",
                delta_color="inverse"
            )
        with kpi_col2:
            st.metric("Expected Monthly Income", format_inr(ml_result["expected_income"]))
        with kpi_col3:
            st.metric("Projected Remaining Balance", format_inr(ml_result["remaining_balance"]), delta="Surplus" if ml_result["remaining_balance"] >= 0 else "Deficit")

        # Overspending banner
        if ml_result["overspending_warning"]:
            st.error(ml_result["overspending_message"])
        else:
            st.success(ml_result["overspending_message"])

        # Model Rationale
        st.info(f"**Trend Analysis:** {ml_result['explanation']}")

        # Regression Trend Chart
        st.subheader("Historical Actuals vs Linear Fit & Forecast")
        st.plotly_chart(
            render_ml_trend_chart(
                ml_result["historical_comparison"],
                next_month_label="Next Month (Forecast)",
                predicted_val=ml_result["predicted_expense"]
            ),
            use_container_width=True
        )

        # Model Coefficients
        with st.expander("🔍 Inspect Machine Learning Model Coefficients"):
            st.write("Linear Regression Equation: `Expense = Intercept + (c1 * Month) + (c2 * Lag1) + (c3 * Rolling3Avg) + (c4 * Income)`")
            st.json({
                "Intercept (Bias)": ml_result["intercept"],
                "Feature Weights": ml_result["coefficients"]
            })
            st.caption("Trained with Scikit-learn Ordinary Least Squares (OLS) algorithm.")

    st.caption("⚠ **Disclaimer:** AI forecast — estimate based on historical trends for planning purposes; not a guarantee of future expenses.")


# ==========================================
# 8. WEALTH SIMULATOR
# ==========================================
elif nav_selection == "💰 Wealth Simulator":
    st.title("💰 What-If Wealth Simulator")
    st.caption("Calculate compound investment growth and compare against standard cash savings.")

    col1, col2 = st.columns(2)
    with col1:
        principal = st.number_input("Starting Balance (₹)", min_value=0.0, value=10000.0, step=5000.0)
        monthly_pmt = st.number_input("Monthly Contribution (₹)", min_value=500.0, value=5000.0, step=500.0)
    with col2:
        return_rate = st.slider("Expected Annual Investment Return (%)", min_value=1.0, max_value=25.0, value=10.0, step=0.5)
        horizon = st.slider("Time Horizon (Years)", min_value=1, max_value=30, value=10)

    sim = compare_investment_vs_cash(principal, monthly_pmt, investment_rate=return_rate, cash_rate=3.0, years=horizon)
    inv_final = sim["investment"]["future_value"]
    cash_final = sim["cash"]["future_value"]
    total_contrib = sim["investment"]["total_contributions"]

    # KPI summary
    k1, k2, k3, k4 = st.columns(4)
    with k1:
        st.metric("Total Deposits", format_inr(total_contrib))
    with k2:
        st.metric("Investment Portfolio", format_inr(inv_final), delta=f"+{format_inr(inv_final - total_contrib)} gain")
    with k3:
        st.metric("Cash Savings (3%)", format_inr(cash_final))
    with k4:
        st.metric("Investment Advantage", format_inr(inv_final - cash_final), delta=f"{((inv_final - cash_final)/cash_final)*100:.1f}% higher")

    st.subheader("Compound Trajectory Over Time")
    st.plotly_chart(render_wealth_projection(sim["comparison_series"]), use_container_width=True)

    st.caption(f"ℹ️ {sim['disclaimer']}")


# ==========================================
# 9. FINANCIAL GOALS
# ==========================================
elif nav_selection == "🏁 Financial Goals":
    st.title("🏁 Financial Goals")
    st.caption("Set concrete milestones and monitor savings accumulation.")

    render_add_goal_form(user_id=user_id, on_success=trigger_rerun)

    st.divider()
    st.subheader("Your Savings Goals")
    if not all_goals:
        st.info("No active savings goals found. Create your first target above!")
    else:
        for g in all_goals:
            target = g["target_amount"]
            current = g["current_amount"]
            pct = round((current / target) * 100.0, 1) if target > 0 else 0.0
            remaining = max(0.0, target - current)

            st.markdown(f"### {g['name']}")
            c_stat, c_bar = st.columns([1, 2])
            with c_stat:
                st.write(f"Saved: **{format_inr(current)}** / {format_inr(target)} ({pct}%)")
                st.caption(f"Remaining: {format_inr(remaining)} | Deadline: {g['deadline'] or 'No deadline'}")
            with c_bar:
                st.progress(min(1.0, current / target))

            # Update goal savings inline
            with st.expander("Update / Manage Goal"):
                new_amt = st.number_input(f"Update Saved Amount for '{g['name']}'", min_value=0.0, value=current, key=f"g_input_{g['id']}")
                if st.button("Save New Amount", key=f"btn_save_{g['id']}"):
                    update_goal_progress(user_id, g["id"], new_amt)
                    st.success("Goal progress updated!")
                    trigger_rerun()
                if st.button("🗑️ Delete Goal", key=f"btn_del_{g['id']}"):
                    delete_goal(user_id, g["id"])
                    st.success("Goal deleted.")
                    trigger_rerun()
            st.write("---")


# ==========================================
# 10. IMPORT / EXPORT
# ==========================================
elif nav_selection == "📁 Import / Export":
    st.title("📁 Import & Export Financial Records")
    
    tab_imp, tab_exp = st.tabs(["📥 Import CSV", "📤 Export Account Records"])
    with tab_imp:
        render_csv_upload_form(user_id=user_id, on_success=trigger_rerun)
    with tab_exp:
        st.subheader("Download All Expenses as CSV")
        if all_expenses:
            df = pd.DataFrame(all_expenses)
            csv_str = df.to_csv(index=False)
            st.download_button(
                label="📥 Download Expenses CSV",
                data=csv_str,
                file_name=f"finsight_export_{date.today().strftime('%Y%m%d')}.csv",
                mime="text/csv"
            )
        else:
            st.info("No expense data available to export.")


# ==========================================
# 11. ABOUT AI & BCA VIVA GUIDE
# ==========================================
elif nav_selection == "🧠 About AI & Viva Guide":
    st.title("🧠 Machine Learning Architecture & Viva Guide")
    st.markdown("""
    ### 🎓 First-Year BCA Project Overview: FinSight AI
    
    #### 1. Machine Learning Methodology
    - **Algorithm:** Linear Regression (Ordinary Least Squares / OLS from `scikit-learn`).
    - **Problem Formulation:** Supervised time-series regression.
    - **Target Variable ($y$):** Next Month Total Expenses.
    - **Engineered Features ($X$):**
      1. `Month_Number` ($t$): Sequential integer capturing temporal progression.
      2. `Previous_Month_Spend` ($y_{t-1}$): Auto-regressive lag component reflecting recent baseline.
      3. `3_Month_Average`: Moving average smoothing out single-month seasonal outliers.
      4. `Income`: Capacity constraint preventing unrealistic spending estimates.

    #### 2. Minimum Data Requirement
    - The model requires at least **3 historical months** before fitting.
    - If $N < 3$, a friendly status message is returned instead of overfitting an erratic line.

    #### 3. Database Architecture (SQLite & SQLAlchemy)
    - `users`: Stores user credentials with PBKDF2:SHA256 password hashing.
    - `expenses`: Tracks discrete expenditures with foreign keys cascade-deleted on user removal.
    - `income`: Tracks inflows (Salary, Freelance, etc.).
    - `budgets`: Category spending limits per month (`YYYY-MM`).
    - `goals`: Financial targets with deadlines and progress meters.

    #### 4. Future Value Compound Formula
    $$FV = P(1 + r)^n + PMT \\left[\\frac{(1 + r)^n - 1}{r}\\right]$$
    where:
    - $P$ = Starting balance (principal)
    - $PMT$ = Monthly contribution
    - $r$ = Monthly interest rate (Annual Rate / 12)
    - $n$ = Number of compounding months (Years $\\times$ 12)

    #### 5. Common Viva Questions & Answers
    1. **Q: Why use SQLite for a BCA project?**  
       *A:* SQLite is serverless, zero-configuration, lightweight, and stores tables in a single `.db` file, making it ideal for local standalone applications.
    2. **Q: Why use Linear Regression over complex Deep Learning?**  
       *A:* Personal finance datasets for an individual typically comprise 12–24 months of aggregate data points. Deep neural networks require millions of records and would severely overfit, whereas Linear Regression is optimal for small time-series data.
    3. **Q: How are passwords secured?**  
       *A:* Using Werkzeug's cryptographic hashing algorithms (`pbkdf2:sha256` or `scrypt`) with random salts, ensuring passwords are never stored in plain text.
    """)


# ==========================================
# 12. SETTINGS
# ==========================================
elif nav_selection == "⚙ Settings":
    st.title("⚙ Account & Application Settings")

    st.subheader("👤 User Profile")
    st.write(f"**Name:** {current_user['name']}")
    st.write(f"**Email:** {current_user['email']}")
    st.write(f"**Registered:** {current_user.get('created_at', 'N/A')}")

    st.divider()
    st.subheader("🧪 Demo Data Controls")
    c_seed, c_clear = st.columns(2)
    with c_seed:
        if st.button("🌱 Re-Seed 14 Months Demo Data", type="primary"):
            count = seed_demo_data(user_id, months_count=14)
            st.success(f"Generated {count} transactions across 14 months!")
            trigger_rerun()
    with c_clear:
        if st.button("🗑️ Clear All My Data"):
            clear_user_data(user_id)
            st.warning("All transactions, budgets, and goals have been wiped.")
            trigger_rerun()

    st.divider()
    st.subheader("🛡️ Privacy & Security Notice")
    st.info(
        "FinSight AI operates locally. Your financial transactions and credentials are stored strictly "
        "inside the local SQLite database. Never upload real credit card numbers, OTPs, or bank passwords."
    )
