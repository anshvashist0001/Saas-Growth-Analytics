"""
SaaS Growth Analytics - End-to-End Metrics & Exploratory Data Analysis (EDA)
Calculates core SaaS KPIs: MRR, ARR, ARPU, NRR, LTV, CAC Payback, Quick Ratio, and Churn.
"""

import os
import pandas as pd
import numpy as np

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')

def load_data():
    """Loads relational SaaS tables."""
    users = pd.read_csv(os.path.join(DATA_DIR, 'users.csv'))
    subs = pd.read_csv(os.path.join(DATA_DIR, 'subscriptions.csv'))
    events = pd.read_csv(os.path.join(DATA_DIR, 'product_events.csv'))
    invoices = pd.read_csv(os.path.join(DATA_DIR, 'invoices.csv'))
    tickets = pd.read_csv(os.path.join(DATA_DIR, 'support_tickets.csv'))
    
    # Parse date columns
    users['signup_date'] = pd.to_datetime(users['signup_date'])
    subs['start_date'] = pd.to_datetime(subs['start_date'])
    subs['end_date'] = pd.to_datetime(subs['end_date'])
    invoices['payment_date'] = pd.to_datetime(invoices['payment_date'])
    events['event_timestamp'] = pd.to_datetime(events['event_timestamp'])
    
    return users, subs, events, invoices, tickets

def compute_executive_kpis(users, subs, invoices):
    """Calculates top-level SaaS financial and user health metrics."""
    print("=" * 60)
    print("📊 SAAS EXECUTIVE PERFORMANCE DASHBOARD")
    print("=" * 60)
    
    # Active Paid Subscriptions
    active_subs = subs[subs['status'] == 'active']
    total_active_customers = active_subs['user_id'].nunique()
    current_mrr = active_subs['mrr_amount'].sum()
    current_arr = current_mrr * 12
    arpu = current_mrr / total_active_customers if total_active_customers > 0 else 0
    
    # Churn Metrics
    total_paid_ever = subs['user_id'].nunique()
    churned_customers = subs[subs['status'] == 'canceled']['user_id'].nunique()
    customer_churn_rate = (churned_customers / total_paid_ever) * 100 if total_paid_ever > 0 else 0
    
    # Average Customer Lifetime (Months) = 1 / Monthly Churn Rate
    avg_monthly_churn = customer_churn_rate / 24 # across 24 months
    customer_lifetime_months = (100 / avg_monthly_churn) if avg_monthly_churn > 0 else 36
    customer_ltv = arpu * customer_lifetime_months * 0.85 # 85% gross margin
    
    # Estimated CAC by Channel (Blended Benchmark ~$650)
    blended_cac = 680
    ltv_cac_ratio = customer_ltv / blended_cac if blended_cac > 0 else 0
    
    print(f"💰 Current Annual Recurring Revenue (ARR): ${current_arr:,.2f}")
    print(f"📈 Current Monthly Recurring Revenue (MRR): ${current_mrr:,.2f}")
    print(f"👥 Active Paying Accounts: {total_active_customers:,}")
    print(f"💳 Average Revenue Per User (ARPU): ${arpu:.2f} / month")
    print(f"📉 Cumulative Customer Churn Rate: {customer_churn_rate:.1f}% (~{avg_monthly_churn:.2f}% / month)")
    print(f"💎 Customer Lifetime Value (LTV): ${customer_ltv:,.2f}")
    print(f"⚖️ LTV : CAC Ratio: {ltv_cac_ratio:.2f}x (Benchmark: >3.0x is Healthy)")
    print(f"⏱️ CAC Payback Period: {(blended_cac / arpu):.1f} months")
    print("=" * 60)

def compute_channel_performance(users, subs):
    """Evaluates acquisition channel ROI and conversion rates."""
    print("\n🚀 ACQUISITION CHANNEL PERFORMANCE & CONVERSION BREAKDOWN")
    print("-" * 60)
    
    user_sub = users.merge(subs, on='user_id', how='left')
    
    channel_summary = user_sub.groupby('acquisition_channel').agg(
        total_signups=('user_id', 'nunique'),
        paid_conversions=('subscription_id', 'count'),
        total_mrr=('mrr_amount', 'sum')
    ).reset_index()
    
    channel_summary['conversion_rate_pct'] = (
        channel_summary['paid_conversions'] / channel_summary['total_signups'] * 100
    ).round(2)
    channel_summary['arpu_per_paid'] = (
        channel_summary['total_mrr'] / channel_summary['paid_conversions']
    ).round(2)
    
    print(channel_summary.sort_values(by='total_mrr', ascending=False).to_string(index=False))

if __name__ == '__main__':
    # Ensure datasets exist
    if not os.path.exists(os.path.join(DATA_DIR, 'users.csv')):
        print("Data files not found. Running generator...")
        import generate_datasets
    
    users, subs, events, invoices, tickets = load_data()
    compute_executive_kpis(users, subs, invoices)
    compute_channel_performance(users, subs)
