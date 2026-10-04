# SaaS growth analytics

An analytics project built around a fictional subscription product. It calculates
recurring revenue, signup-cohort retention, an ordered onboarding funnel and a
simple account-health score from CSV tables. The Streamlit app includes a DuckDB
query editor so the same calculations can be inspected directly.

All data is synthetic. Revenue figures describe the dataset, not a real business.

## Quick start

Python 3.10 or newer is required.

```bash
git clone https://github.com/anshvashist0001/Saas-Growth-Analytics.git
cd Saas-Growth-Analytics
python -m venv .venv
# Windows PowerShell
.venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
python -m pip install -r requirements.txt
streamlit run app.py
```

Open the URL printed by Streamlit, normally `http://localhost:8501`. Start with
Revenue, then inspect Retention and Activation. The SQL studio executes the
selected query against the loaded tables; it does not return canned results.

## Data and reproducibility

The repository includes a small fixture with **15 users and 13 subscriptions**.
It is useful for reading the records and checking calculations by hand. To replace
the fixture with a larger, deterministic dataset:

```bash
python python/generate_datasets.py
python python/saas_analytics.py
python python/cohort_analysis.py
python python/churn_prediction.py
```

The generator uses seed 42 and creates 2,500 users. It overwrites the five CSVs in
`data/`; keep a copy of the fixture if you want to compare the two datasets.
The app notices CSV modification times and reloads its cached data.

| Table | What it contains |
|---|---|
| `users.csv` | Signup dates, company attributes and acquisition channel |
| `subscriptions.csv` | Plan prices, subscription start dates and cancellations |
| `product_events.csv` | Timestamped signup and feature-use events |
| `invoices.csv` | Billing amounts and payment status |
| `support_tickets.csv` | Support categories, status and satisfaction scores |

## Metric definitions

- **MRR:** total contracted monthly price of subscriptions active immediately
  before the next month begins. Invoice cash collections are a separate measure.
- **ARR:** MRR × 12; it is an annualized run rate, not annual recognized revenue.
- **NRR:** ending MRR from accounts that were active in the previous month,
  divided by their starting MRR. New accounts are excluded.
- **Logo churn:** accounts falling from positive MRR to zero during the month,
  divided by the number active in the previous month.
- **Retention:** distinct users with at least one event in a month, divided by
  all signups in that cohort. Observed zero-activity months are zero; future
  months are blank.
- **Funnel:** signup → setup → teammate invitation → dashboard creation → paid
  subscription. Each timestamp must follow the preceding step.
- **Health score:** a documented activity/support heuristic, not a learned
  probability of churn.

The schema does not include plan-change history or acquisition spending. Expansion
and contraction can therefore be zero; CAC and LTV/CAC are not reported.
See [the methods note](docs/PROJECT_EXECUTIVE_SUMMARY.md) for caveats.

## Churn baseline

`python/churn_prediction.py` uses the first 30 days of behavior to predict a
cancellation in the following 90 days. It splits accounts chronologically and
excludes training rows whose outcome window reaches into the test period.
The small fixture is intentionally rejected as insufficient for useful model
evaluation. Generate the larger dataset before running it.

The script prints the measured ROC-AUC, average precision and prevalence; no fixed
score is promised. Synthetic-data performance does not demonstrate real customer
retention or financial savings.

## Browser snapshot

`index.html` is a lightweight view of `data/summary.json`. It does not execute SQL
or connect to a live company database.

```bash
python python/saas_analytics.py
python -m http.server 8000
```

Open `http://localhost:8000`. Regenerate the snapshot whenever the CSVs change.

## Project layout

```text
app.py              Streamlit views
analytics.py        CSV loading and shared query execution
sql/                Revenue, retention, funnel, adoption and health queries
python/             Dataset generation, CLI reports and churn baseline
data/               Synthetic fixture and generated browser snapshot
docs/               Methods and discussion notes
test_analytics.py   Revenue and retention regression checks
```

## Validation

```bash
python -m pip install pytest
python -m pytest -q
```

Tests check that the MRR waterfall reconciles, cancellations appear even without
an invoice in the cancellation month, cohort denominators include all signups,
future months remain blank, and ordered funnel counts never increase.

## Limits and troubleshooting

The generator is a simplified simulation: plan prices are fixed, invoices use
30-day intervals, and feature-use behavior is scripted. It is unsuitable for
claiming causal product effects or real-world business outcomes.

Run the SQL editor locally with trusted queries. Its SELECT-only check is not an
isolation boundary; DuckDB table functions can read local files. Do not expose it
as a public multi-user service without adding proper isolation and resource limits.

If the snapshot will not load, serve the directory over HTTP rather than opening
`index.html` as a local file. If a Python dependency is missing, confirm that the
virtual environment is active and reinstall `requirements.txt`.
