"""Metrics calculated from the checked-in synthetic CSV tables."""
from pathlib import Path
import pandas as pd
import numpy as np
import duckdb

ROOT = Path(__file__).resolve().parent
TABLES = ['users','subscriptions','product_events','invoices','support_tickets']
DATE_COLUMNS = {'users':['signup_date'],'subscriptions':['start_date','end_date'],
                'product_events':['event_timestamp'],'invoices':['payment_date'],
                'support_tickets':['created_at']}


def load_tables(directory=ROOT/'data'):
    tables = {name:pd.read_csv(Path(directory)/f'{name}.csv') for name in TABLES}
    for name, cols in DATE_COLUMNS.items():
        for col in cols:
            tables[name][col] = pd.to_datetime(tables[name][col])
    return tables


def connection(tables):
    con = duckdb.connect(':memory:')
    for name, df in tables.items():
        con.register(name, df)
    return con


def run_sql_file(tables, filename):
    with connection(tables) as con:
        return con.execute((ROOT/'sql'/filename).read_text()).df()


def monthly_revenue(tables):
    return run_sql_file(tables, '01_mrr_arr_waterfall.sql')


def retention(tables):
    rows = run_sql_file(tables, '02_cohort_retention.sql')
    return rows.pivot(index='cohort_month',columns='month_offset',values='retention_pct')


def funnel(tables):
    return run_sql_file(tables, '03_funnel_conversion.sql')


def health(tables):
    return run_sql_file(tables, '05_churn_health_score.sql')


def summary(tables):
    revenue = monthly_revenue(tables)
    latest = revenue.iloc[-1]
    return {'as_of':str(latest['month'].date()),'users':len(tables['users']),
            'mrr':float(latest['ending_mrr']),'arr':float(latest['ending_mrr']*12),
            'active_accounts':int(latest['active_accounts']),
            'nrr_pct':None if pd.isna(latest['nrr_pct']) else float(latest['nrr_pct']),
            'logo_churn_pct':None if pd.isna(latest['logo_churn_pct']) else float(latest['logo_churn_pct'])}
