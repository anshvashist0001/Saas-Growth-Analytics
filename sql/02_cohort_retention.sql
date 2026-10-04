-- Event activity retention: every signup belongs to a cohort; zero activity
-- in an observed month is 0%, while not-yet-observed months are NULL.
WITH cohorts AS (
 SELECT user_id,date_trunc('month',signup_date)::DATE AS cohort_month FROM users
), sizes AS (
 SELECT cohort_month,count(*) AS cohort_size FROM cohorts GROUP BY 1
), grid AS (
 SELECT *,cohort_month + month_offset*INTERVAL '1 month' AS activity_month
 FROM sizes CROSS JOIN range(13) t(month_offset)
), activity AS (
 SELECT c.cohort_month,date_diff('month',c.cohort_month,e.event_timestamp) AS month_offset,
 count(DISTINCT c.user_id) AS active_users
 FROM cohorts c JOIN product_events e USING (user_id) GROUP BY 1,2
)
SELECT g.cohort_month,g.month_offset,g.cohort_size,
 CASE WHEN g.activity_month > date_trunc('month',(SELECT max(event_timestamp) FROM product_events))
 THEN NULL ELSE 100.0*coalesce(a.active_users,0)/g.cohort_size END AS retention_pct
FROM grid g LEFT JOIN activity a USING(cohort_month,month_offset) ORDER BY 1,2;
