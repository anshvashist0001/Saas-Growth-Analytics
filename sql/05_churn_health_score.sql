-- A transparent heuristic, not a learned churn probability.
WITH latest AS (
 SELECT greatest((SELECT max(event_timestamp) FROM product_events),
                 (SELECT max(end_date) FROM subscriptions),
                 (SELECT max(payment_date) FROM invoices)) AS as_of
), activity AS (
 SELECT user_id,max(event_timestamp) AS last_active,
 count(*) FILTER(WHERE event_timestamp >= (SELECT as_of FROM latest)-INTERVAL '30 days') AS recent_events
 FROM product_events GROUP BY 1
), tickets AS (
 SELECT user_id,count(*) FILTER(WHERE ticket_status IN ('open','escalated')) AS unresolved
 FROM support_tickets GROUP BY 1
), active AS (
 SELECT DISTINCT user_id FROM subscriptions WHERE start_date<=(SELECT as_of FROM latest)
 AND (end_date IS NULL OR end_date>(SELECT as_of FROM latest))
)
SELECT u.user_id,u.company_name,a.last_active,coalesce(a.recent_events,0) AS recent_events,
 coalesce(t.unresolved,0) AS unresolved_tickets,
 greatest(0,least(100,CASE WHEN a.last_active>=(SELECT as_of FROM latest)-INTERVAL '30 days'
 THEN 60 ELSE 20 END + least(40,coalesce(a.recent_events,0)*5)-coalesce(t.unresolved,0)*10)) AS health_score
FROM users u JOIN active USING(user_id) LEFT JOIN activity a USING(user_id)
LEFT JOIN tickets t USING(user_id) ORDER BY health_score,u.user_id;
