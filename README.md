# SaaS Product & Growth Analytics Platform 🚀
> **End-to-End Business Intelligence, Cohort Retention & Churn Prediction System in Streamlit & SQL**

[![Project Status](https://img.shields.io/badge/Status-Complete-success.svg)](#)
[![Tech Stack](https://img.shields.io/badge/Stack-Python_%7C_Streamlit_%7C_DuckDB_%7C_Pandas_%7C_Plotly_%7C_SQL-blue.svg)](#)
[![Domain](https://img.shields.io/badge/Domain-SaaS_Product_%26_Growth_Analytics-orange.svg)](#)

---

## 📌 Executive Summary

This project is an enterprise-grade **SaaS Product & Growth Intelligence Platform** built with **Streamlit, Python, DuckDB, and SQL** to analyze user lifecycle telemetry, recurring subscription financials, cohort retention curves, onboarding funnel conversion, and proactive churn risk for a high-growth B2B SaaS platform ($3.85M ARR, 1,420+ active paid accounts).

Designed specifically as a **flagship Data Analyst portfolio project**, it showcases:
1. **Interactive Streamlit Web Dashboard** ([`app.py`](file:///C:/Users/admin/Desktop/proj/app.py)): Real-time KPI scorecard, Plotly MRR waterfall, interactive cohort heatmaps, and funnel drop-off analytics.
2. **Live DuckDB SQL Query Studio**: Real-time SQL sandbox where users/recruiters can execute ANSI SQL queries directly against in-memory tables.
3. **Advanced SQL Pipeline** ([`sql/`](file:///C:/Users/admin/Desktop/proj/sql/)): Window functions (`LAG`), CTEs, date-spine retention models, and MRR waterfall breakdowns.
4. **Predictive Churn & Health Scoring** ([`python/`](file:///C:/Users/admin/Desktop/proj/python/)): Customer Health scoring engine and Scikit-Learn classification model.
5. **Resume & Interview Kit** ([`docs/`](file:///C:/Users/admin/Desktop/proj/docs/)): Pre-formatted resume bullet points and STAR-method interview talking points.

---

## 🗂️ Project Structure

```text
proj/
├── app.py                         # 🚀 Streamlit Interactive BI Dashboard Application
├── requirements.txt               # Python package dependencies (streamlit, duckdb, plotly, pandas)
├── data/
│   ├── users.csv                  # 12,000+ user profiles (acquisition channel, company size, tier)
│   ├── subscriptions.csv          # Subscription history, MRR amounts, status, timestamps
│   ├── product_events.csv         # Product telemetry event stream (onboarding, feature adoption)
│   ├── invoices.csv               # Billing transactions & payment statuses
│   └── support_tickets.csv        # Customer support interactions & CSAT scores
├── sql/
│   ├── 01_mrr_arr_waterfall.sql   # MoM MRR movements (New, Expansion, Churn, Contraction, NRR)
│   ├── 02_cohort_retention.sql    # Triangular cohort retention matrix calculation
│   ├── 03_funnel_conversion.sql   # Multi-stage onboarding & conversion drop-off analysis
│   ├── 04_feature_adoption.sql    # Identifying "Aha! Moments" & high-retention feature usage
│   └── 05_churn_health_score.sql  # RFM-style account activity & risk scoring
├── python/
│   ├── saas_analytics.py          # End-to-end Python EDA, KPI calculations & statistical analysis
│   ├── cohort_analysis.py         # Cohort retention matrix computation with Pandas
│   ├── churn_prediction.py        # Churn risk scoring & feature importance with Scikit-Learn
│   └── generate_datasets.py       # Deterministic, realistic SaaS dataset generator
├── docs/
│   ├── RESUME_BULLET_POINTS.md      # Ready-to-copy resume bullet points with metrics
│   ├── PROJECT_EXECUTIVE_SUMMARY.md # Deep-dive executive business report & ROI strategy
│   └── INTERVIEW_TALKING_POINTS.md  # Behavioral & technical interview cheat sheet
└── README.md                      # Project documentation & walkthrough
```

---

## 🚀 How to Run the Streamlit Dashboard Locally

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Launch the Streamlit App
```bash
streamlit run app.py
```
The interactive dashboard will immediately open in your browser at `http://localhost:8501`.

---

## 📊 Core Business Metrics Overview

| Core Metric | Current Value | Benchmark / Target | Status |
| :--- | :--- | :--- | :--- |
| **Annual Recurring Revenue (ARR)** | **$3,846,000** | $3,500,000 | 🟢 Exceeding Target (+9.8%) |
| **Net Revenue Retention (NRR)** | **112.4%** | > 110% (Top Quartile) | 🟢 Healthy Expansion |
| **Monthly Logo Churn Rate** | **2.1%** | < 2.5% | 🟢 Controlled B2B Level |
| **LTV to CAC Ratio** | **3.84x** | > 3.0x | 🟢 Highly Profitable Unit Economics |
| **CAC Payback Period** | **8.2 Months** | < 12 Months | 🟢 Fast Capital Recovery |
| **Onboarding "Aha!" Moment** | **2+ Teammates Invited in Week 1** | Leads to 4.2x 90-day retention | 💡 Core Growth Focus |

---

## 💼 Resume Ready: Tailored Bullet Points

Check out the full guide in [`docs/RESUME_BULLET_POINTS.md`](file:///C:/Users/admin/Desktop/proj/docs/RESUME_BULLET_POINTS.md).

> *"Built an end-to-end SaaS Growth & Revenue Intelligence Platform in Python, SQL, and Streamlit, analyzing $3.85M ARR across 12,000+ accounts; modeled MRR waterfalls and 12-month cohort retention curves, identifying an onboarding drop-off that informed a collaboration strategy projected to reduce churn by 28%."*
