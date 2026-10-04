import pandas as pd
import numpy as np
from analytics import monthly_revenue, retention, funnel, load_tables


def test_waterfall_reconciles_and_counts_cancellation():
    tables = load_tables()
    tables['subscriptions'] = pd.DataFrame([
        ['s1','u1',100,'2024-01-05','2024-03-05'],
        ['s2','u2',200,'2024-02-05',None]],
        columns=['subscription_id','user_id','mrr_amount','start_date','end_date'])
    for c in ['start_date','end_date']:
        tables['subscriptions'][c] = pd.to_datetime(tables['subscriptions'][c])
    for name,col in [('users','signup_date'),('product_events','event_timestamp'),('invoices','payment_date')]:
        tables[name] = tables[name].iloc[:1].copy()
        tables[name][col] = pd.Timestamp('2024-04-01')
    rows = monthly_revenue(tables)
    assert np.allclose(rows.ending_mrr,rows.starting_mrr+rows.new_mrr+rows.expansion_mrr-rows.contraction_mrr-rows.churn_mrr)
    march = rows.iloc[2]
    assert march.churn_mrr == 100 and march.ending_mrr == 200
    assert np.isclose(march.nrr_pct,200/300*100)


def test_cohort_uses_signup_denominator_and_distinguishes_unobserved():
    tables = load_tables()
    tables['users'] = pd.DataFrame({'user_id':['a','b','c'],'signup_date':pd.to_datetime(['2024-01-01','2024-01-01','2024-02-01'])})
    tables['product_events'] = pd.DataFrame({'user_id':['a','a','c'],'event_timestamp':pd.to_datetime(['2024-01-01','2024-03-01','2024-02-01'])})
    matrix = retention(tables)
    assert matrix.iloc[0,0] == 50
    assert matrix.iloc[0,1] == 0
    assert pd.isna(matrix.iloc[1,2])


def test_ordered_funnel_is_monotone():
    counts = funnel(load_tables()).users.to_numpy()
    assert (np.diff(counts)<=0).all()
