"""
SaaS Growth Analytics - Cohort Retention Matrix Engine
Calculates monthly signup cohort retention matrices and decay curves.
"""

import os
import pandas as pd
import numpy as np

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')

def generate_cohort_matrix():
    """Builds a triangle cohort retention matrix."""
    users = pd.read_csv(os.path.join(DATA_DIR, 'users.csv'))
    events = pd.read_csv(os.path.join(DATA_DIR, 'product_events.csv'))
    
    users['signup_date'] = pd.to_datetime(users['signup_date'])
    events['event_timestamp'] = pd.to_datetime(events['event_timestamp'])
    
    # 1. Define Cohort Month (Signup)
    users['cohort_month'] = users['signup_date'].dt.to_period('M')
    
    # 2. Define Activity Month
    events['activity_month'] = events['event_timestamp'].dt.to_period('M')
    
    # Merge users with events
    df = events.merge(users[['user_id', 'cohort_month']], on='user_id')
    
    # Calculate month offset (period index: 0, 1, 2, ...)
    df['cohort_index'] = (df['activity_month'].dt.year - df['cohort_month'].dt.year) * 12 + \
                         (df['activity_month'].dt.month - df['cohort_month'].dt.month)
    
    # Filter valid indexes
    df = df[(df['cohort_index'] >= 0) & (df['cohort_index'] <= 12)]
    
    # Group by Cohort Month and Cohort Index
    cohort_group = df.groupby(['cohort_month', 'cohort_index'])['user_id'].nunique().reset_index()
    
    # Pivot into Triangle Matrix
    cohort_matrix = cohort_group.pivot(index='cohort_month', columns='cohort_index', values='user_id')
    
    # Calculate Cohort Base Sizes (Month 0)
    cohort_sizes = cohort_matrix.iloc[:, 0]
    
    # Calculate Retention Percentages
    retention_matrix = cohort_matrix.divide(cohort_sizes, axis=0) * 100
    
    print("=" * 80)
    print("👥 SAAS COHORT RETENTION MATRIX (%) - RECENT 12 COHORTS")
    print("=" * 80)
    print(retention_matrix.tail(12).round(1).fillna('').to_string())
    print("=" * 80)
    
    # Average Retention Curve
    avg_retention = retention_matrix.mean(axis=0).round(1)
    print("\n📈 BENCHMARK SAAS RETENTION DECAY CURVE (Average across all cohorts):")
    for month_idx, rate in avg_retention.items():
        bar = "█" * int(rate // 4)
        print(f"  Month {month_idx:2d}: {rate:5.1f}% | {bar}")

if __name__ == '__main__':
    generate_cohort_matrix()
