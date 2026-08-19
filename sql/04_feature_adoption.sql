-- ==============================================================================
-- 04. Feature Adoption & Product Stickiness Analysis ("Aha! Moment" Discovery)
-- Purpose: Evaluate which product features correlate with long-term 90-day retention
--          and identify sticky user behavioral patterns.
-- Dialect: ANSI SQL / DuckDB / PostgreSQL / Snowflake Compatible
-- ==============================================================================

WITH user_first_30_days_activity AS (
    -- Step 1: Count feature interactions within the first 30 days of user lifecycle
    SELECT
        u.user_id,
        u.signup_date,
        COUNT(CASE WHEN e.event_name = 'created_analytics_dashboard' THEN 1 END) AS dashboards_created_30d,
        COUNT(CASE WHEN e.event_name = 'invited_teammate' THEN 1 END) AS team_invites_30d,
        COUNT(CASE WHEN e.event_name = 'exported_csv_pdf_report' THEN 1 END) AS exports_30d,
        COUNT(CASE WHEN e.event_name = 'integrated_third_party_api' THEN 1 END) AS integrations_30d,
        COUNT(CASE WHEN e.event_name = 'set_scheduled_alert' THEN 1 END) AS alerts_configured_30d,
        COUNT(DISTINCT DATE_TRUNC('day', e.event_timestamp)) AS active_days_first_30d
    FROM users u
    LEFT JOIN product_events e ON u.user_id = e.user_id 
        AND e.event_timestamp <= u.signup_date + INTERVAL '30 days'
    GROUP BY u.user_id, u.signup_date
),

user_retention_90d AS (
    -- Step 2: Determine if user remained active in days 61-90 (90-Day Retention Flag)
    SELECT
        u.user_id,
        CASE 
            WHEN COUNT(e.event_id) > 0 THEN 1 
            ELSE 0 
        END AS is_retained_90d
    FROM users u
    LEFT JOIN product_events e ON u.user_id = e.user_id 
        AND e.event_timestamp BETWEEN (u.signup_date + INTERVAL '60 days') AND (u.signup_date + INTERVAL '90 days')
    GROUP BY u.user_id
),

feature_adoption_cohorts AS (
    -- Step 3: Segment users by behavioral tiers
    SELECT
        a.user_id,
        r.is_retained_90d,
        a.active_days_first_30d,
        
        CASE 
            WHEN a.team_invites_30d >= 2 THEN '2+ Teammates Invited'
            WHEN a.team_invites_30d = 1 THEN '1 Teammate Invited'
            ELSE 'Solo User (0 Invites)'
        END AS team_collaboration_tier,
        
        CASE 
            WHEN a.integrations_30d >= 1 THEN 'API Connected'
            ELSE 'No Integration'
        END AS integration_tier,
        
        CASE 
            WHEN a.alerts_configured_30d >= 1 THEN 'Automated Alerts Set'
            ELSE 'No Alerts'
        END AS alert_tier,
        
        CASE 
            WHEN a.dashboards_created_30d >= 3 THEN 'Heavy Creator (3+ Dashboards)'
            WHEN a.dashboards_created_30d BETWEEN 1 AND 2 THEN 'Moderate Creator (1-2)'
            ELSE 'Passive Viewer (0)'
        END AS dashboard_creation_tier

    FROM user_first_30_days_activity a
    JOIN user_retention_90d r ON a.user_id = r.user_id
)

-- Step 4: Compare 90-Day Retention Rates across Feature Adoption Groups
SELECT
    'Team Collaboration' AS feature_dimension,
    team_collaboration_tier AS feature_segment,
    COUNT(user_id) AS total_users,
    SUM(is_retained_90d) AS retained_users_90d,
    ROUND(SUM(is_retained_90d) * 100.0 / COUNT(user_id), 2) AS retention_rate_90d_pct,
    ROUND(AVG(active_days_first_30d), 1) AS avg_active_days_month_1
FROM feature_adoption_cohorts
GROUP BY team_collaboration_tier

UNION ALL

SELECT
    'API Integrations' AS feature_dimension,
    integration_tier AS feature_segment,
    COUNT(user_id) AS total_users,
    SUM(is_retained_90d) AS retained_users_90d,
    ROUND(SUM(is_retained_90d) * 100.0 / COUNT(user_id), 2) AS retention_rate_90d_pct,
    ROUND(AVG(active_days_first_30d), 1) AS avg_active_days_month_1
FROM feature_adoption_cohorts
GROUP BY integration_tier

UNION ALL

SELECT
    'Automated Alerts' AS feature_dimension,
    alert_tier AS feature_segment,
    COUNT(user_id) AS total_users,
    SUM(is_retained_90d) AS retained_users_90d,
    ROUND(SUM(is_retained_90d) * 100.0 / COUNT(user_id), 2) AS retention_rate_90d_pct,
    ROUND(AVG(active_days_first_30d), 1) AS avg_active_days_month_1
FROM feature_adoption_cohorts
GROUP BY alert_tier

ORDER BY feature_dimension, retention_rate_90d_pct DESC;
