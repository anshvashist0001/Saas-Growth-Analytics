-- Ordered onboarding funnel: each next step must follow the previous one.
WITH setup AS (
 SELECT u.user_id,u.signup_date,min(e.event_timestamp) AS setup_at
 FROM users u LEFT JOIN product_events e ON u.user_id=e.user_id
 AND e.event_name='completed_workspace_setup' AND e.event_timestamp>=u.signup_date
 GROUP BY 1,2
), invite AS (
 SELECT s.*,min(e.event_timestamp) AS invite_at FROM setup s LEFT JOIN product_events e
 ON s.user_id=e.user_id AND e.event_name='invited_teammate' AND e.event_timestamp>=s.setup_at
 GROUP BY 1,2,3
), dashboard AS (
 SELECT i.*,min(e.event_timestamp) AS dashboard_at FROM invite i LEFT JOIN product_events e
 ON i.user_id=e.user_id AND e.event_name='created_analytics_dashboard' AND e.event_timestamp>=i.invite_at
 GROUP BY 1,2,3,4
), paid AS (
 SELECT d.*,min(s.start_date) AS paid_at FROM dashboard d LEFT JOIN subscriptions s
 ON d.user_id=s.user_id AND s.start_date>=d.dashboard_at GROUP BY 1,2,3,4,5
)
SELECT 1 AS step,'Signed up' AS stage,count(*) AS users FROM paid
UNION ALL SELECT 2,'Workspace setup',count(setup_at) FROM paid
UNION ALL SELECT 3,'Invited teammate',count(invite_at) FROM paid
UNION ALL SELECT 4,'Created dashboard',count(dashboard_at) FROM paid
UNION ALL SELECT 5,'Started paid subscription',count(paid_at) FROM paid ORDER BY step;
