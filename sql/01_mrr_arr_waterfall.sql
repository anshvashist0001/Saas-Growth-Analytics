-- Month-end contracted MRR. A zero-MRR row is retained after cancellation,
-- so LAG can measure churn. Invoice collections are a separate cash metric.
WITH bounds AS (
 SELECT date_trunc('month', min(start_date))::DATE AS first_month,
        date_trunc('month', greatest((SELECT max(signup_date) FROM users),
            (SELECT max(event_timestamp) FROM product_events),
            (SELECT max(payment_date) FROM invoices),
            (SELECT max(end_date) FROM subscriptions)))::DATE AS last_month
 FROM subscriptions
), months AS (
 SELECT month::DATE AS month FROM bounds,
 generate_series(first_month,last_month,INTERVAL '1 month') t(month)
), account_month AS (
 SELECT m.month, s.user_id,
 SUM(CASE WHEN s.start_date < m.month + INTERVAL '1 month'
          AND (s.end_date IS NULL OR s.end_date >= m.month + INTERVAL '1 month')
          THEN s.mrr_amount ELSE 0 END) AS mrr
 FROM months m CROSS JOIN subscriptions s GROUP BY 1,2
), changes AS (
 SELECT *, lag(mrr,1,0) OVER (PARTITION BY user_id ORDER BY month) AS previous
 FROM account_month
)
SELECT month, sum(previous) AS starting_mrr,
 sum(CASE WHEN previous=0 AND mrr>0 THEN mrr ELSE 0 END) AS new_mrr,
 sum(CASE WHEN previous>0 AND mrr>previous THEN mrr-previous ELSE 0 END) AS expansion_mrr,
 sum(CASE WHEN mrr>0 AND mrr<previous THEN previous-mrr ELSE 0 END) AS contraction_mrr,
 sum(CASE WHEN previous>0 AND mrr=0 THEN previous ELSE 0 END) AS churn_mrr,
 sum(mrr) AS ending_mrr, count(*) FILTER (WHERE mrr>0) AS active_accounts,
 100.0*sum(CASE WHEN previous>0 THEN mrr ELSE 0 END)/nullif(sum(previous),0) AS nrr_pct,
 100.0*count(*) FILTER (WHERE previous>0 AND mrr=0)/
 nullif(count(*) FILTER (WHERE previous>0),0) AS logo_churn_pct
FROM changes GROUP BY month ORDER BY month;
