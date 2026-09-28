"""
FinSight AI — Plotly Visualization Components
Modern, startup-aesthetic interactive charts designed for Streamlit.
Uses sleek dark/modern palettes with responsive layouts.
"""

from typing import List, Dict, Any
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd


# Consistent Brand Color Palette
THEME_COLORS = {
    "emerald": "#10b981",
    "indigo": "#6366f1",
    "violet": "#8b5cf6",
    "rose": "#f43f5e",
    "amber": "#f59e0b",
    "cyan": "#06b6d4",
    "slate_dark": "#0f172a",
    "slate_card": "#1e293b",
    "grid_color": "rgba(148, 163, 184, 0.15)"
}

PALETTE = [
    "#10b981", "#6366f1", "#f59e0b", "#ec4899", "#06b6d4",
    "#8b5cf6", "#f43f5e", "#14b8a6", "#3b82f6", "#eab308"
]


def render_category_donut(category_data: Dict[str, float]) -> go.Figure:
    """
    Renders an interactive Donut chart showing category breakdown.
    """
    if not category_data or sum(category_data.values()) == 0:
        fig = go.Figure()
        fig.add_annotation(
            text="No spending recorded for this period",
            showarrow=False,
            font=dict(size=14, color="#94a3b8")
        )
        fig.update_layout(paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)", height=320)
        return fig

    labels = list(category_data.keys())
    values = list(category_data.values())

    fig = go.Figure(data=[go.Pie(
        labels=labels,
        values=values,
        hole=0.62,
        marker=dict(colors=PALETTE[:len(labels)]),
        textinfo="percent+label",
        hoverinfo="label+value+percent",
        hovertemplate="<b>%{label}</b><br>Amount: ₹%{value:,.2f}<br>Share: %{percent}<extra></extra>"
    )])

    fig.update_layout(
        showlegend=True,
        legend=dict(orientation="h", yanchor="bottom", y=-0.25, xanchor="center", x=0.5),
        margin=dict(t=20, b=30, l=10, r=10),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        height=340
    )
    return fig


def render_monthly_expense_trend(monthly_data: List[Dict[str, Any]]) -> go.Figure:
    """
    Renders a smooth line/area chart of monthly expenses over time.
    """
    if not monthly_data:
        fig = go.Figure()
        fig.add_annotation(text="No monthly history available", showarrow=False, font=dict(size=14, color="#94a3b8"))
        fig.update_layout(height=320, paper_bgcolor="rgba(0,0,0,0)")
        return fig

    df = pd.DataFrame(monthly_data)
    fig = go.Figure()

    # Gradient fill area
    fig.add_trace(go.Scatter(
        x=df["month"],
        y=df["expense"],
        mode="lines+markers",
        name="Expenses",
        line=dict(color="#f43f5e", width=3, shape="spline"),
        marker=dict(size=7, color="#f43f5e", line=dict(width=2, color="#ffffff")),
        fill="tozeroy",
        fillcolor="rgba(244, 63, 94, 0.12)",
        hovertemplate="Month: %{x}<br>Expense: ₹%{y:,.2f}<extra></extra>"
    ))

    fig.update_layout(
        margin=dict(t=20, b=40, l=40, r=20),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        xaxis=dict(showgrid=True, gridcolor=THEME_COLORS["grid_color"], tickangle=-30),
        yaxis=dict(showgrid=True, gridcolor=THEME_COLORS["grid_color"], tickprefix="₹"),
        height=320
    )
    return fig


def render_income_vs_expense(monthly_data: List[Dict[str, Any]]) -> go.Figure:
    """
    Renders side-by-side comparative bars for Income vs Expenses.
    """
    if not monthly_data:
        fig = go.Figure()
        fig.add_annotation(text="No monthly data recorded", showarrow=False)
        fig.update_layout(height=320, paper_bgcolor="rgba(0,0,0,0)")
        return fig

    df = pd.DataFrame(monthly_data)
    fig = go.Figure()

    fig.add_trace(go.Bar(
        x=df["month"],
        y=df["income"],
        name="Income",
        marker_color="#10b981",
        hovertemplate="Income: ₹%{y:,.2f}<extra></extra>"
    ))

    fig.add_trace(go.Bar(
        x=df["month"],
        y=df["expense"],
        name="Expense",
        marker_color="#f43f5e",
        hovertemplate="Expense: ₹%{y:,.2f}<extra></extra>"
    ))

    fig.update_layout(
        barmode="group",
        margin=dict(t=20, b=40, l=40, r=20),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
        xaxis=dict(showgrid=False, tickangle=-30),
        yaxis=dict(showgrid=True, gridcolor=THEME_COLORS["grid_color"], tickprefix="₹"),
        height=340
    )
    return fig


def render_category_bar(category_data: Dict[str, float]) -> go.Figure:
    """
    Renders horizontal category spending comparison bars.
    """
    if not category_data:
        fig = go.Figure()
        fig.add_annotation(text="No category data available", showarrow=False)
        fig.update_layout(height=320, paper_bgcolor="rgba(0,0,0,0)")
        return fig

    cats = list(category_data.keys())[::-1]
    values = [category_data[c] for c in cats]

    fig = go.Figure(go.Bar(
        x=values,
        y=cats,
        orientation="h",
        marker=dict(color="#6366f1"),
        hovertemplate="%{y}: ₹%{x:,.2f}<extra></extra>"
    ))

    fig.update_layout(
        margin=dict(t=20, b=30, l=90, r=20),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        xaxis=dict(showgrid=True, gridcolor=THEME_COLORS["grid_color"], tickprefix="₹"),
        yaxis=dict(showgrid=False),
        height=340
    )
    return fig


def render_savings_trend(monthly_data: List[Dict[str, Any]]) -> go.Figure:
    """
    Renders savings rate (%) progress line over time.
    """
    if not monthly_data:
        fig = go.Figure()
        fig.add_annotation(text="No data for savings trend", showarrow=False)
        fig.update_layout(height=320, paper_bgcolor="rgba(0,0,0,0)")
        return fig

    df = pd.DataFrame(monthly_data)
    fig = go.Figure()

    fig.add_trace(go.Scatter(
        x=df["month"],
        y=df["savings_rate"],
        mode="lines+markers",
        name="Savings Rate %",
        line=dict(color="#06b6d4", width=3),
        marker=dict(size=7, color="#06b6d4"),
        hovertemplate="Month: %{x}<br>Savings Rate: %{y:.1f}%<extra></extra>"
    ))

    fig.update_layout(
        margin=dict(t=20, b=40, l=40, r=20),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        xaxis=dict(showgrid=True, gridcolor=THEME_COLORS["grid_color"], tickangle=-30),
        yaxis=dict(showgrid=True, gridcolor=THEME_COLORS["grid_color"], ticksuffix="%"),
        height=320
    )
    return fig


def render_wealth_projection(comparison_series: List[Dict[str, Any]]) -> go.Figure:
    """
    Renders comparative wealth trajectories: Investment vs Cash vs Contributions.
    """
    df = pd.DataFrame(comparison_series)
    fig = go.Figure()

    fig.add_trace(go.Scatter(
        x=df["year"],
        y=df["investment_value"],
        name="Investment Growth (e.g. 10%)",
        mode="lines",
        line=dict(color="#10b981", width=3.5),
        hovertemplate="Year %{x}<br>Investment: ₹%{y:,.0f}<extra></extra>"
    ))

    fig.add_trace(go.Scatter(
        x=df["year"],
        y=df["cash_value"],
        name="Savings Account (3%)",
        mode="lines",
        line=dict(color="#6366f1", width=2.5, dash="dash"),
        hovertemplate="Year %{x}<br>Cash: ₹%{y:,.0f}<extra></extra>"
    ))

    fig.add_trace(go.Scatter(
        x=df["year"],
        y=df["contributions"],
        name="Total Deposited",
        mode="lines",
        line=dict(color="#94a3b8", width=1.5, dash="dot"),
        hovertemplate="Year %{x}<br>Deposited: ₹%{y:,.0f}<extra></extra>"
    ))

    fig.update_layout(
        margin=dict(t=20, b=40, l=50, r=20),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="center", x=0.5),
        xaxis=dict(title="Years Elapsed", showgrid=True, gridcolor=THEME_COLORS["grid_color"]),
        yaxis=dict(title="Portfolio Value (₹)", showgrid=True, gridcolor=THEME_COLORS["grid_color"], tickprefix="₹"),
        height=380
    )
    return fig


def render_ml_trend_chart(historical_comparison: List[Dict[str, Any]], next_month_label: str, predicted_val: float) -> go.Figure:
    """
    Renders actual spending trend vs regression line plus projected forecast marker.
    """
    df = pd.DataFrame(historical_comparison)
    fig = go.Figure()

    # Actual historical points
    fig.add_trace(go.Scatter(
        x=df["month"],
        y=df["actual"],
        mode="lines+markers",
        name="Actual Expense",
        line=dict(color="#3b82f6", width=2.5),
        marker=dict(size=6, color="#3b82f6"),
        hovertemplate="%{x}: ₹%{y:,.2f}<extra></extra>"
    ))

    # Fitted regression trend line
    fig.add_trace(go.Scatter(
        x=df["month"],
        y=df["fitted_trend"],
        mode="lines",
        name="Linear Regression Fit",
        line=dict(color="#f59e0b", width=2, dash="dash"),
        hovertemplate="Fitted: ₹%{y:,.2f}<extra></extra>"
    ))

    # Forecast point
    fig.add_trace(go.Scatter(
        x=[next_month_label],
        y=[predicted_val],
        mode="markers",
        name="AI Forecast",
        marker=dict(size=14, color="#10b981", symbol="diamond", line=dict(width=2, color="#ffffff")),
        hovertemplate="Forecast (%{x}): ₹%{y:,.2f}<extra></extra>"
    ))

    fig.update_layout(
        margin=dict(t=20, b=40, l=50, r=20),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
        xaxis=dict(showgrid=True, gridcolor=THEME_COLORS["grid_color"], tickangle=-30),
        yaxis=dict(showgrid=True, gridcolor=THEME_COLORS["grid_color"], tickprefix="₹"),
        height=360
    )
    return fig
