-- Unique users who used each feature. This measures usage, not causal lift.
SELECT event_name,count(DISTINCT user_id) AS users,
 100.0*count(DISTINCT user_id)/(SELECT count(*) FROM users) AS adoption_pct
FROM product_events WHERE event_name!='signed_up' GROUP BY 1 ORDER BY users DESC;
