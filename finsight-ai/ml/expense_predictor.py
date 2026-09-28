"""
FinSight AI — Machine Learning Expense Predictor
Uses Scikit-learn Linear Regression on aggregated historical monthly spending.
Includes feature engineering:
  - Month_Number (time trend)
  - Previous_Month_Spend (lag feature)
  - 3_Month_Average (rolling trend smoothing)
  - Income (monthly capacity feature)
"""

from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression


def predict_next_month_expenses(
    monthly_data: List[Dict[str, Any]],
    current_expected_income: float = 0.0
) -> Dict[str, Any]:
    """
    Trains a Linear Regression model on monthly spending records and forecasts next month expenses.
    
    Parameters:
      monthly_data: List of dicts with keys:
                    'month' (str YYYY-MM), 'expense' (float), 'income' (float)
      current_expected_income: Fallback / user-declared expected monthly income.

    Returns:
      Dictionary containing:
        - status: 'success' | 'insufficient_data'
        - message: Context explanation
        - predicted_expense: float
        - previous_expense: float
        - percentage_change: float
        - trend_direction: 'up' | 'down' | 'flat'
        - explanation: Simple student-friendly rationale
        - overspending_warning: bool
        - overspending_message: str
        - expected_income: float
        - remaining_balance: float
        - historical_comparison: List of actual vs trend points
    """
    # Guard: Require at least 3 distinct monthly data points for meaningful time series modeling
    if len(monthly_data) < 3:
        return {
            "status": "insufficient_data",
            "message": (
                "Not enough historical data for a reliable prediction. "
                "Add at least 3 months of expenses to generate a forecast."
            ),
            "min_required": 3,
            "current_months": len(monthly_data),
            "predicted_expense": 0.0,
            "previous_expense": monthly_data[-1]["expense"] if monthly_data else 0.0,
            "percentage_change": 0.0,
            "trend_direction": "flat",
            "explanation": "Machine learning algorithms require at least 3 historical time periods to discern direction and momentum.",
            "overspending_warning": False,
            "overspending_message": "",
            "expected_income": current_expected_income,
            "remaining_balance": 0.0,
            "historical_comparison": []
        }

    # Convert to DataFrame and sort chronologically
    df = pd.DataFrame(monthly_data)
    df["expense"] = pd.to_numeric(df["expense"], errors="coerce").fillna(0.0)
    df["income"] = pd.to_numeric(df["income"], errors="coerce").fillna(0.0)

    # If current_expected_income is 0, infer from recent income average
    if current_expected_income <= 0:
        recent_incomes = df["income"].tail(3).values
        avg_income = float(np.mean(recent_incomes)) if len(recent_incomes) > 0 else 0.0
        current_expected_income = avg_income

    # Build sequential Month_Number (1, 2, 3...)
    df["Month_Number"] = np.arange(1, len(df) + 1)
    
    # Lag 1: Previous month spend
    df["Previous_Month_Spend"] = df["expense"].shift(1)
    
    # 3-Month Rolling Average
    df["3_Month_Average"] = df["expense"].rolling(window=3, min_periods=1).mean()

    # For training, fill any initial NaN in lag with the first available value
    df["Previous_Month_Spend"] = df["Previous_Month_Spend"].bfill()

    # Feature matrix X and target y
    feature_cols = ["Month_Number", "Previous_Month_Spend", "3_Month_Average", "income"]
    X = df[feature_cols].values
    y = df["expense"].values

    # Train Linear Regression
    model = LinearRegression()
    model.fit(X, y)

    # Construct feature vector for NEXT month (T + 1)
    next_month_num = len(df) + 1
    last_expense = float(df["expense"].iloc[-1])
    recent_3_avg = float(df["expense"].tail(3).mean())
    next_income = float(current_expected_income)

    X_next = np.array([[next_month_num, last_expense, recent_3_avg, next_income]])
    predicted_val = float(model.predict(X_next)[0])
    
    # Expense cannot be negative in real life
    predicted_val = max(0.0, round(predicted_val, 2))

    # Calculate percentage change vs previous month
    if last_expense > 0:
        pct_change = round(((predicted_val - last_expense) / last_expense) * 100.0, 1)
    else:
        pct_change = 0.0

    if pct_change > 0.5:
        direction = "up"
        trend_word = "increasing"
    elif pct_change < -0.5:
        direction = "down"
        trend_word = "decreasing"
    else:
        direction = "flat"
        trend_word = "stable"

    # Rule-based simple explanation
    if direction == "up":
        explanation = (
            "Your predicted expenses are increasing mainly because your recent monthly spending "
            "trend has risen across consecutive periods."
        )
    elif direction == "down":
        explanation = (
            "Your predicted expenses are decreasing because your recent spending discipline "
            "has trended downwards over the last few months."
        )
    else:
        explanation = (
            "Your predicted expenses remain stable and consistent with your 3-month baseline average."
        )

    # Overspending check against income
    remaining_balance = round(current_expected_income - predicted_val, 2)
    if current_expected_income > 0 and predicted_val > current_expected_income:
        overspending = True
        overspending_msg = (
            f"⚠ Your forecasted expenses ({predicted_val:,.0f}) are higher than your expected income ({current_expected_income:,.0f}). "
            "Consider reviewing discretionary budgets to prevent a deficit."
        )
    else:
        overspending = False
        overspending_msg = "Your forecast currently shows expenses comfortably below your expected income."

    # Build historical trend comparison for charts
    fitted_values = model.predict(X)
    historical_comparison = []
    for idx, row in df.iterrows():
        historical_comparison.append({
            "month": str(row.get("month", f"Month {int(row['Month_Number'])}")),
            "actual": round(float(row["expense"]), 2),
            "fitted_trend": round(float(fitted_values[idx]), 2)
        })

    return {
        "status": "success",
        "message": "Model trained successfully.",
        "predicted_expense": predicted_val,
        "previous_expense": round(last_expense, 2),
        "percentage_change": pct_change,
        "trend_direction": direction,
        "explanation": explanation,
        "overspending_warning": overspending,
        "overspending_message": overspending_msg,
        "expected_income": round(current_expected_income, 2),
        "remaining_balance": remaining_balance,
        "historical_comparison": historical_comparison,
        "coefficients": {
            col: round(float(coef), 3) for col, coef in zip(feature_cols, model.coef_)
        },
        "intercept": round(float(model.intercept_), 2)
    }
