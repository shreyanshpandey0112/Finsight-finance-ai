"""
FinSight AI — Wealth Simulation Service
Simulates compound interest growth and compares investment returns against baseline savings accounts.
Strictly educational and non-prescriptive.
"""

from typing import Dict, Any, List
from utils.calculations import calculate_future_value


def simulate_wealth_growth(
    starting_balance: float,
    monthly_contribution: float,
    annual_return_percent: float,
    years: int
) -> Dict[str, Any]:
    """
    Executes compound wealth projection for user parameters.
    """
    return calculate_future_value(
        principal=max(0.0, starting_balance),
        monthly_contribution=max(0.0, monthly_contribution),
        annual_rate_percent=max(0.0, annual_return_percent),
        years=max(1, years)
    )


def compare_investment_vs_cash(
    starting_balance: float,
    monthly_contribution: float,
    investment_rate: float,
    cash_rate: float = 3.0,
    years: int = 10
) -> Dict[str, Any]:
    """
    Compares investment growth (e.g., 10% diversified index proxy) vs conservative cash savings (e.g., 3%).
    Generates combined trajectory series for dual-line Plotly visualization.
    """
    inv_result = simulate_wealth_growth(starting_balance, monthly_contribution, investment_rate, years)
    cash_result = simulate_wealth_growth(starting_balance, monthly_contribution, cash_rate, years)

    comparison_series = []
    for y_inv, y_cash in zip(inv_result["yearly_breakdown"], cash_result["yearly_breakdown"]):
        comparison_series.append({
            "year": y_inv["year"],
            "contributions": y_inv["contributed"],
            "investment_value": y_inv["balance"],
            "cash_value": y_cash["balance"],
            "difference": round(y_inv["balance"] - y_cash["balance"], 2)
        })

    return {
        "investment": inv_result,
        "cash": cash_result,
        "years": years,
        "comparison_series": comparison_series,
        "disclaimer": (
            "This simulator is for educational and illustrative purposes only and does not guarantee investment returns. "
            "Past performance and assumed rates of return do not guarantee future market outcomes."
        )
    }
