"""Temporal churn baseline: first 30 days of behavior, cancellation in the next 90."""
import json
import sys
from pathlib import Path
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.pipeline import make_pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score, average_precision_score
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from analytics import load_tables


def build_dataset(tables):
    subs = tables['subscriptions'].copy()
    end = max(tables['product_events'].event_timestamp.max(),tables['invoices'].payment_date.max(),tables['subscriptions'].end_date.max())
    subs['observed_at'] = subs.start_date + pd.Timedelta(days=30)
    subs['target_end'] = subs.observed_at + pd.Timedelta(days=90)
    subs = subs[(subs.target_end<=end) & (subs.end_date.isna() | (subs.end_date>subs.observed_at))]
    # One row per account avoids the same account appearing on both sides of a split.
    subs = subs.sort_values('start_date').drop_duplicates('user_id')
    rows = []
    for s in subs.itertuples():
        ev = tables['product_events']
        ev = ev[(ev.user_id==s.user_id) & (ev.event_timestamp>=s.start_date) & (ev.event_timestamp<s.observed_at)]
        tk = tables['support_tickets']
        tk = tk[(tk.user_id==s.user_id) & (tk.created_at>=s.start_date) & (tk.created_at<s.observed_at)]
        rows.append({'user_id':s.user_id,'observed_at':s.observed_at,'target_end':s.target_end,
                     'plan_tier':s.plan_tier,'mrr_amount':s.mrr_amount,
                     'events_30d':len(ev),'invites_30d':int((ev.event_name=='invited_teammate').sum()),
                     'tickets_30d':len(tk),
                     'churned':int(pd.notna(s.end_date) and s.end_date<=s.target_end)})
    return pd.DataFrame(rows)


def train_and_evaluate():
    df = build_dataset(load_tables())
    if len(df)<100:
        print('Insufficient sample for a useful churn evaluation. Generate the 2,500-user dataset first.')
        return None
    df = df.sort_values('observed_at')
    cutoff = df.iloc[int(len(df)*.75)].observed_at
    # Purge training labels whose outcome window reaches into the test period.
    train, test = df[df.target_end<cutoff],df[df.observed_at>=cutoff]
    if train.churned.nunique()<2 or test.churned.nunique()<2:
        print('Both classes are required in train and test; no ROC-AUC reported.')
        return None
    columns = ['plan_tier','mrr_amount','events_30d','invites_30d','tickets_30d']
    prep = ColumnTransformer([('tier',OneHotEncoder(handle_unknown='ignore'),['plan_tier']),
                             ('numeric',SimpleImputer(),columns[1:])])
    model = make_pipeline(prep,RandomForestClassifier(n_estimators=100,max_depth=5,random_state=42))
    model.fit(train[columns],train.churned)
    probabilities = model.predict_proba(test[columns])[:,1]
    result = {'train_accounts':len(train),'test_accounts':len(test),
              'roc_auc':float(roc_auc_score(test.churned,probabilities)),
              'average_precision':float(average_precision_score(test.churned,probabilities)),
              'test_prevalence':float(test.churned.mean()),'split':'chronological with 90-day label purge',
              'note':'Synthetic-data baseline; no demonstrated business impact.'}
    print(json.dumps(result,indent=2))
    return result


if __name__ == '__main__':
    train_and_evaluate()
