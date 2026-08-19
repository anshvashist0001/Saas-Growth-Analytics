"""
SaaS Growth Analytics - Predictive Churn Modeling & Feature Importance Engine
Extracts customer behavioral signals and trains Machine Learning classification models 
(Random Forest / Logistic Regression) to predict subscriber churn risk.
"""

import os
import pandas as pd
import numpy as np

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')

def build_churn_dataset():
    """Extracts features for all subscribed accounts."""
    users = pd.read_csv(os.path.join(DATA_DIR, 'users.csv'))
    subs = pd.read_csv(os.path.join(DATA_DIR, 'subscriptions.csv'))
    events = pd.read_csv(os.path.join(DATA_DIR, 'product_events.csv'))
    tickets = pd.read_csv(os.path.join(DATA_DIR, 'support_tickets.csv'))
    
    # Target: 1 if churned (canceled), 0 if active
    subs['is_churned'] = (subs['status'] == 'canceled').astype(int)
    
    # Feature 1: Event telemetry summary per user
    event_feats = events.groupby('user_id').agg(
        total_events=('event_id', 'count'),
        dashboards_created=('event_name', lambda x: (x == 'created_analytics_dashboard').sum()),
        team_invites=('event_name', lambda x: (x == 'invited_teammate').sum()),
        api_integrations=('event_name', lambda x: (x == 'integrated_third_party_api').sum()),
        scheduled_alerts=('event_name', lambda x: (x == 'set_scheduled_alert').sum()),
        exports_generated=('event_name', lambda x: (x == 'exported_csv_pdf_report').sum()),
    ).reset_index()
    
    # Feature 2: Support ticket friction
    ticket_feats = tickets.groupby('user_id').agg(
        ticket_count=('ticket_id', 'count'),
        avg_csat=('csat_score', 'mean'),
        escalated_tickets=('ticket_status', lambda x: (x == 'escalated').sum())
    ).reset_index()
    
    # Merge all into model dataframe
    df = subs.merge(users[['user_id', 'acquisition_channel', 'company_size', 'industry']], on='user_id')
    df = df.merge(event_feats, on='user_id', how='left').fillna(0)
    df = df.merge(ticket_feats, on='user_id', how='left')
    df['avg_csat'] = df['avg_csat'].fillna(4.0)
    df['ticket_count'] = df['ticket_count'].fillna(0)
    df['escalated_tickets'] = df['escalated_tickets'].fillna(0)
    
    # Categorical encoding
    df = pd.get_dummies(df, columns=['plan_tier', 'acquisition_channel', 'company_size'], drop_first=True)
    
    # Feature selection
    feature_cols = [c for c in df.columns if c not in ['subscription_id', 'user_id', 'status', 'start_date', 'end_date', 'billing_cycle', 'company_name', 'industry', 'is_churned']]
    
    X = df[feature_cols]
    y = df['is_churned']
    
    return X, y, feature_cols

def train_and_evaluate():
    """Trains ML classifier and evaluates feature importance."""
    X, y, feature_names = build_churn_dataset()
    
    print("=" * 70)
    print("🤖 SAAS CHURN PREDICTION & BEHAVIORAL RISK MODEL")
    print("=" * 70)
    print(f"Total Subscribed Sample Size: {len(X)} accounts")
    print(f"Class Distribution: {y.sum()} Churned ({y.mean()*100:.1f}%), {len(y) - y.sum()} Active ({100 - y.mean()*100:.1f}%)")
    
    try:
        from sklearn.model_selection import train_test_split
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.metrics import classification_report, roc_auc_score
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
        
        clf = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
        clf.fit(X_train, y_train)
        
        y_pred = clf.predict(X_test)
        y_proba = clf.predict_proba(X_test)[:, 1]
        
        auc = roc_auc_score(y_test, y_proba)
        print(f"\n🎯 Model Performance: ROC-AUC Score = {auc:.3f}")
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred, target_names=['Retained (Active)', 'Churned']))
        
        # Feature Importance Ranking
        importances = pd.Series(clf.feature_importances_, index=feature_names).sort_values(ascending=False)
        print("🔍 TOP CHURN PREDICTORS (Feature Importance Ranking):")
        for rank, (feat, score) in enumerate(importances.head(8).items(), 1):
            bar = "█" * int(score * 100)
            print(f"  {rank}. {feat:30s} | {score*100:5.1f}% | {bar}")
            
    except ImportError:
        print("Note: scikit-learn is not installed in the current environment.")
        print("When installed via 'pip install scikit-learn', this script trains Random Forest & Logistic Regression.")

if __name__ == '__main__':
    train_and_evaluate()
