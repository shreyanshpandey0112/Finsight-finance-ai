# FinSight AI — Personal Finance & Expense Predictor

A modern, startup-grade personal finance dashboard and machine learning expense predictor built with **Python 3.11+**, **Streamlit**, **SQLite**, **SQLAlchemy**, and **Scikit-learn**. Designed specifically as a high-distinction, first-year BCA (Bachelor of Computer Applications) academic project.

---

## 🌟 Key Features

1. **Top-Level KPI Dashboard**: Real-time tracking of Monthly Income, Total Expenses, Remaining Surplus/Deficit, and Savings Rate with Indian Rupee (₹) formatting.
2. **AI Expense Predictor**: Supervised Linear Regression time-series forecasting with lag features, 3-month rolling averages, and overspending warnings.
3. **Budget Utilization & Alerts**: Category budget meters with dynamic alerts when exceeding 80% or 100% of limits.
4. **Interactive Financial Analytics**: Five high-fidelity Plotly charts including Category Distribution Donut, Monthly Trend, Income vs Expense bars, and Savings Rate trajectories.
5. **What-If Wealth Simulator**: Compound interest projection engine based on the Future Value annuity formula with Cash (3%) vs Investment (10%) comparative modeling.
6. **Financial Goals Tracker**: Visual progress meters and milestone tracking (laptops, emergency funds, vacations).
7. **Searchable & Filterable Transactions**: Full CRUD support with category filters, price range sliders, keyword search, and one-click deletion.
8. **CSV Import & Export**: Automated CSV validation conforming to schema `(Date, Category, Description, Amount)`.
9. **Authentication & Data Isolation**: PBKDF2/Scrypt cryptographic password hashing via Werkzeug with relational multi-user isolation.
10. **One-Click Demo Mode**: Generates 14+ months of realistic synthetic income, expense, and budget history for instant testing.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend UI** | Streamlit + Custom CSS | Responsive, modern web interface and dashboard components |
| **Charts** | Plotly Graph Objects | Interactive charts, donuts, grouped bars, and regression curves |
| **Backend** | Python 3.11+ | Business logic, calculations, and service controllers |
| **Database** | SQLite + SQLAlchemy ORM | Lightweight relational persistence with foreign keys |
| **Machine Learning** | Scikit-learn (`LinearRegression`) | Supervised expenditure forecasting using Ordinary Least Squares |
| **Data Processing** | Pandas & NumPy | Vectorized time-series aggregation and feature engineering |
| **Security** | Werkzeug | Cryptographic password hashing and verification |

---

## 📁 Project Structure

```
finsight-ai/
│
├── app.py                      # Main Streamlit web application entrypoint
├── requirements.txt            # Package dependencies list
├── README.md                   # Comprehensive documentation & Viva guide
├── .gitignore                  # Git ignore rules for DB and bytecode
│
├── database/
│   ├── database.py             # SQLite engine setup, sessionmaker, and context manager
│   └── models.py               # SQLAlchemy ORM models (User, Expense, Income, Budget, Goal)
│
├── auth/
│   └── authentication.py       # Password hashing, validation, registration, and login
│
├── ml/
│   └── expense_predictor.py    # Scikit-learn Linear Regression pipeline with lag features
│
├── services/
│   ├── expense_service.py      # CRUD for expenses, incomes, budgets, and demo data generator
│   ├── analytics_service.py    # Time-series aggregation and rule-based smart insights
│   └── investment_service.py   # Future value compound growth & cash-vs-investment comparisons
│
├── components/
│   ├── dashboard.py            # KPI cards and budget utilization meters
│   ├── charts.py               # Plotly chart builders (Donut, Line, Bar, ML fit)
│   └── forms.py                # Reusable input forms with client validation
│
├── utils/
│   ├── calculations.py         # Financial math (savings rate, compound interest formula)
│   └── helpers.py              # Indian Rupee formatting, date utilities, and CSV validator
│
├── data/
│   └── demo_expenses.csv       # Pre-packaged sample CSV for testing import
│
└── assets/                     # Logos, icons, and static assets
```

---

## 🚀 Installation & Local Execution

### Prerequisites
- Python 3.10 or Python 3.11+ installed on your computer.
- Git (optional, for cloning).

### Step-by-Step Setup

1. **Open your terminal or command prompt** and navigate to the project directory:
   ```bash
   cd finsight-ai
   ```

2. **Create a virtual environment**:
   - On Windows:
     ```bash
     python -m venv venv
     venv\Scripts\activate
     ```
   - On macOS / Linux:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install the dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Launch the application**:
   ```bash
   streamlit run app.py
   ```

5. The dashboard will automatically open in your browser at `http://localhost:8501`.

---

## 🤖 How the Machine Learning Model Works

### 1. The Machine Learning Problem
Predicting future expenses is framed as a **supervised regression task** on aggregated time-series data:
$$\text{Given monthly spending history } (M_1, M_2, \dots, M_t), \text{ predict } M_{t+1}.$$

### 2. Feature Engineering
Raw dates and amounts are aggregated into monthly buckets ($M$). Four features are synthesized:
- **`Month_Number` ($t$)**: An integer sequence ($1, 2, 3, \dots$) capturing long-term growth or decline.
- **`Previous_Month_Spend` ($M_{t-1}$)**: The primary autoregressive lag feature capturing immediate momentum.
- **`3_Month_Average`**: A rolling moving average that dampens seasonal or irregular spending spikes.
- **`Income`**: Current monthly income serving as an economic boundary condition.

### 3. Model Training & Mathematics
We use **Ordinary Least Squares (OLS) Linear Regression**:
$$\hat{y} = \beta_0 + \beta_1 X_1 + \beta_2 X_2 + \beta_3 X_3 + \beta_4 X_4$$
where:
- $\hat{y}$ = Predicted Next Month Spend
- $\beta_0$ = Intercept (baseline expenditure)
- $\beta_i$ = Learned regression weights for each engineered feature

### 4. Insufficient Data Guard
A fundamental principle of statistical learning is preventing arbitrary curve fitting:
- If fewer than **3 months** of spending history exist, FinSight AI displays:
  > *"Not enough historical data for a reliable prediction. Add at least 3 months of expenses to generate a forecast."*
- If $\ge 3$ months exist, the model trains, provides confidence estimates, and flags potential overspending against income.

---

## 🧮 Compound Growth Mathematical Formula

The Wealth Simulator implements the classical **Future Value of an Annuity with an Initial Principal**:
$$FV = P(1 + r)^n + PMT \times \left[\frac{(1 + r)^n - 1}{r}\right]$$
where:
- **$P$**: Initial starting balance (Principal)
- **$PMT$**: Regular monthly deposit / contribution
- **$r$**: Monthly rate of return ($\frac{\text{Annual Percentage Rate}}{12 \times 100}$)
- **$n$**: Total compounding periods ($\text{Years} \times 12$)

---

## 🗄️ Database Architecture

Using **SQLite3** and **SQLAlchemy ORM**:
- **`users`**: `id` (PK), `name`, `email` (unique), `password_hash`, `created_at`
- **`expenses`**: `id` (PK), `user_id` (FK $\rightarrow$ `users.id`), `date`, `category`, `description`, `amount`
- **`income`**: `id` (PK), `user_id` (FK $\rightarrow$ `users.id`), `date`, `source`, `amount`
- **`budgets`**: `id` (PK), `user_id` (FK $\rightarrow$ `users.id`), `month` (YYYY-MM), `category`, `budget_amount`
- **`goals`**: `id` (PK), `user_id` (FK $\rightarrow$ `users.id`), `name`, `target_amount`, `current_amount`, `deadline`

---

## 🎓 BCA Viva Questions & Answers

1. **Why use SQLite instead of MySQL or PostgreSQL for this project?**  
   *Answer:* SQLite is a serverless, zero-configuration database that resides entirely in a single file on disk. For a desktop/local personal finance application, it simplifies deployment, requires no background database daemon, and provides full ACID compliance.

2. **Why choose Linear Regression instead of a Deep Learning model (like LSTM or RNN)?**  
   *Answer:* Deep neural networks require tens of thousands of data points to avoid severe overfitting. An individual user typically records only 12 to 36 months of spending history. Linear Regression with feature engineering is statistically robust, highly interpretable, computationally lightweight, and perfectly suited for small sample time-series data.

3. **How does the application ensure password security?**  
   *Answer:* Passwords are never stored in plain text. We utilize `werkzeug.security` to hash passwords using PBKDF2 with SHA-256 (or Scrypt) with unique random cryptographic salts, protecting against rainbow table and dictionary attacks.

4. **What is Feature Engineering in this project?**  
   *Answer:* Feature Engineering is the process of using domain knowledge to extract informative inputs from raw data. Instead of passing only raw dates, we compute chronological month indexes, lag features (`Previous_Month_Spend`), and rolling 3-month moving averages.

5. **How does the system handle division-by-zero errors in financial metrics?**  
   *Answer:* In functions such as `calculate_savings_rate()`, if income is zero or negative, the function safely returns `0.0%` rather than throwing a `ZeroDivisionError` exception.

---

## 🔮 Future Improvements

- **Bank SMS & Statement OCR Parser**: Automated transaction parsing from PDF bank statements.
- **Advanced Anomaly Detection**: Isolation Forests to flag abnormal subscription charges or unauthorized purchases.
- **Multi-Currency FX Rates**: Real-time foreign exchange conversions via Open Exchange Rates API.
- **Progressive Web App (PWA) / Mobile App**: Flutter or React Native mobile interface.
- **Category Recommendation Engine**: K-Nearest Neighbors (KNN) or Naive Bayes classifier to automatically categorize transaction descriptions.

---

## 📜 License & Disclaimers

FinSight AI is developed as an educational project. Expense predictions and wealth simulations are mathematical estimates for planning purposes and do not constitute certified financial or investment advice.
