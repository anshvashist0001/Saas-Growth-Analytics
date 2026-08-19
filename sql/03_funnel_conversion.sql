-- ==============================================================================
-- 03. SaaS Product Onboarding & Conversion Funnel Analysis
-- Purpose: Quantify conversion velocity and stage-by-stage drop-off from 
--          Sign-up -> Workspace Setup -> Team Invite -> Core Feature -> Paid Upgrade.
-- Dialect: ANSI SQL / DuckDB / PostgreSQL / Snowflake Compatible
-- ==============================================================================

WITH user_funnel_milestones AS (
    -- Step 1: Find the first occurrence timestamp for each user across the key onboarding steps
    SELECT
        u.user_id,
        u.signup_date,
        u.acquisition_channel,
        u.plan_tier,
        
        -- Step 1: Signup (Baseline)
        1 AS step_1_signed_up,
        u.signup_date AS step_1_timestamp,
        
        -- Step 2: Completed Workspace Setup
        MAX(CASE WHEN e.event_name = 'completed_workspace_setup' THEN 1 ELSE 0 END) AS step_2_setup_completed,
        MIN(CASE WHEN e.event_name = 'completed_workspace_setup' THEN e.event_timestamp END) AS step_2_timestamp,
        
        -- Step 3: Invited Team Member
        MAX(CASE WHEN e.event_name = 'invited_teammate' THEN 1 ELSE 0 END) AS step_3_invited_teammate,
        MIN(CASE WHEN e.event_name = 'invited_teammate' THEN e.event_timestamp END) AS step_3_timestamp,
        
        -- Step 4: Used Core Product Feature (Created Custom Dashboard / Pipeline)
        MAX(CASE WHEN e.event_name = 'created_analytics_dashboard' THEN 1 ELSE 0 END) AS step_4_core_feature_used,
        MIN(CASE WHEN e.event_name = 'created_analytics_dashboard' THEN e.event_timestamp END) AS step_4_timestamp,
        
        -- Step 5: Converted to Paid Subscription
        MAX(CASE WHEN s.subscription_id IS NOT NULL AND s.plan_tier IN ('Pro', 'Enterprise', 'Growth') THEN 1 ELSE 0 END) AS step_5_paid_converted,
        MIN(s.start_date) AS step_5_timestamp

    FROM users u
    LEFT JOIN product_events e ON u.user_id = e.user_id
    LEFT JOIN subscriptions s ON u.user_id = s.user_id
    GROUP BY u.user_id, u.signup_date, u.acquisition_channel, u.plan_tier
)

-- Step 2: Aggregate Stage Funnel Counts, Conversion Rates, and Median Time-to-Convert (Hours)
SELECT
    acquisition_channel,
    COUNT(user_id) AS total_signups,
    
    -- Milestone Counts
    SUM(step_2_setup_completed) AS setup_completed_users,
    SUM(step_3_invited_teammate) AS invited_teammate_users,
    SUM(step_4_core_feature_used) AS core_feature_users,
    SUM(step_5_paid_converted) AS paid_converted_users,
    
    -- Cumulative Conversion Rates (% of initial signups)
    ROUND(SUM(step_2_setup_completed) * 100.0 / COUNT(user_id), 2) AS pct_setup_completed,
    ROUND(SUM(step_3_invited_teammate) * 100.0 / COUNT(user_id), 2) AS pct_invited_teammate,
    ROUND(SUM(step_4_core_feature_used) * 100.0 / COUNT(user_id), 2) AS pct_core_feature_used,
    ROUND(SUM(step_5_paid_converted) * 100.0 / COUNT(user_id), 2) AS overall_conversion_rate,
    
    -- Stage-over-Stage Drop-off Rates
    ROUND(100.0 - (SUM(step_2_setup_completed) * 100.0 / COUNT(user_id)), 2) AS dropoff_step_1_to_2_pct,
    ROUND(100.0 - (SUM(step_3_invited_teammate) * 100.0 / NULLIF(SUM(step_2_setup_completed), 0)), 2) AS dropoff_step_2_to_3_pct,
    ROUND(100.0 - (SUM(step_4_core_feature_used) * 100.0 / NULLIF(SUM(step_3_invited_teammate), 0)), 2) AS dropoff_step_3_to_4_pct,
    ROUND(100.0 - (SUM(step_5_paid_converted) * 100.0 / NULLIF(SUM(step_4_core_feature_used), 0)), 2) AS dropoff_step_4_to_5_pct

FROM user_funnel_milestones
GROUP BY acquisition_channel
ORDER BY total_signups DESC;
