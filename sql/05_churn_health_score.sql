-- ==============================================================================
-- 05. Customer Health & Churn Risk Scoring Engine
-- Purpose: Extract account-level RFM telemetry (Recency, Frequency, Support Friction,
--          License Utilization) to score accounts and predict high-risk churn candidates.
-- Dialect: ANSI SQL / DuckDB / PostgreSQL / Snowflake Compatible
-- ==============================================================================

WITH account_metrics AS (
    -- Step 1: Compute RFM (Recency, Frequency) and usage signals per active subscriber
    SELECT
        u.user_id,
        u.company_name,
        u.company_size,
        u.industry,
        u.acquisition_channel,
        s.subscription_id,
        s.plan_tier,
        s.mrr_amount,
        s.start_date AS subscription_start,
        
        -- Recency: Days since last logged-in event
        DATEDIFF('day', MAX(e.event_timestamp), CURRENT_DATE) AS days_since_last_active,
        
        -- Frequency: Active days in the past 30 days
        COUNT(DISTINCT CASE 
            WHEN e.event_timestamp >= CURRENT_DATE - INTERVAL '30 days' 
            THEN DATE_TRUNC('day', e.event_timestamp) 
        END) AS active_days_last_30d,
        
        -- Feature breadth: Count of distinct core actions in past 30 days
        COUNT(DISTINCT CASE 
            WHEN e.event_timestamp >= CURRENT_DATE - INTERVAL '30 days' 
            THEN e.event_name 
        END) AS distinct_actions_last_30d,
        
        -- Support friction: Count of open or negative CSAT tickets
        COUNT(CASE WHEN t.ticket_status IN ('open', 'escalated') THEN 1 END) AS unresolved_tickets_count,
        AVG(CASE WHEN t.csat_score IS NOT NULL THEN t.csat_score END) AS avg_csat_score,
        
        -- Seats / Team Collaboration utilization
        COUNT(DISTINCT CASE WHEN e.event_name = 'invited_teammate' THEN e.event_id END) AS total_teammates_invited

    FROM users u
    JOIN subscriptions s ON u.user_id = s.user_id AND s.status = 'active'
    LEFT JOIN product_events e ON u.user_id = e.user_id
    LEFT JOIN support_tickets t ON u.user_id = t.user_id
    GROUP BY 
        u.user_id, u.company_name, u.company_size, u.industry, u.acquisition_channel,
        s.subscription_id, s.plan_tier, s.mrr_amount, s.start_date
),

health_scoring AS (
    -- Step 2: Calculate sub-scores (0 to 100 points each) based on empirical risk thresholds
    SELECT
        user_id,
        company_name,
        company_size,
        industry,
        plan_tier,
        mrr_amount,
        days_since_last_active,
        active_days_last_30d,
        distinct_actions_last_30d,
        unresolved_tickets_count,
        COALESCE(avg_csat_score, 4.0) AS avg_csat_score,
        total_teammates_invited,
        
        -- Activity Score (40% Weight): Based on Recency and 30-day Frequency
        CASE
            WHEN days_since_last_active <= 3 AND active_days_last_30d >= 12 THEN 100
            WHEN days_since_last_active <= 7 AND active_days_last_30d >= 6  THEN 75
            WHEN days_since_last_active <= 14 AND active_days_last_30d >= 2 THEN 45
            WHEN days_since_last_active <= 30 THEN 20
            ELSE 5
        END AS activity_score,
        
        -- Breadth & Collaboration Score (30% Weight): Team invites & dashboard usage
        CASE
            WHEN total_teammates_invited >= 3 AND distinct_actions_last_30d >= 5 THEN 100
            WHEN total_teammates_invited >= 1 AND distinct_actions_last_30d >= 3 THEN 75
            WHEN distinct_actions_last_30d >= 2 THEN 50
            ELSE 20
        END AS engagement_score,
        
        -- Support Satisfaction Score (30% Weight): Low open tickets, high CSAT
        CASE
            WHEN unresolved_tickets_count = 0 AND COALESCE(avg_csat_score, 5.0) >= 4.0 THEN 100
            WHEN unresolved_tickets_count = 1 AND COALESCE(avg_csat_score, 5.0) >= 3.0 THEN 70
            WHEN unresolved_tickets_count >= 2 OR COALESCE(avg_csat_score, 5.0) < 3.0 THEN 30
            ELSE 10
        END AS satisfaction_score

    FROM account_metrics
)

-- Step 3: Composite Customer Health Score (0 - 100) & Risk Categorization
SELECT
    user_id,
    company_name,
    company_size,
    industry,
    plan_tier,
    mrr_amount,
    days_since_last_active,
    active_days_last_30d,
    unresolved_tickets_count,
    avg_csat_score,
    total_teammates_invited,
    
    -- Composite Health Score = (Activity * 0.40) + (Engagement * 0.30) + (Satisfaction * 0.30)
    ROUND((activity_score * 0.40) + (engagement_score * 0.30) + (satisfaction_score * 0.30), 0) AS health_score,
    
    -- Churn Risk Tier
    CASE
        WHEN ((activity_score * 0.40) + (engagement_score * 0.30) + (satisfaction_score * 0.30)) >= 75 THEN 'Low Risk (Healthy)'
        WHEN ((activity_score * 0.40) + (engagement_score * 0.30) + (satisfaction_score * 0.30)) >= 50 THEN 'Medium Risk (Monitor)'
        ELSE 'High Risk (Immediate Action)'
    END AS churn_risk_segment,
    
    -- Prescriptive Action Recommendation
    CASE
        WHEN ((activity_score * 0.40) + (engagement_score * 0.30) + (satisfaction_score * 0.30)) < 50 AND days_since_last_active > 14 
            THEN 'Trigger Automated Re-engagement Workflow & CS Outreach'
        WHEN ((activity_score * 0.40) + (engagement_score * 0.30) + (satisfaction_score * 0.30)) < 50 AND unresolved_tickets_count > 1 
            THEN 'Escalate Support Ticket to Senior Solutions Engineer'
        WHEN ((activity_score * 0.40) + (engagement_score * 0.30) + (satisfaction_score * 0.30)) < 50 AND total_teammates_invited = 0 
            THEN 'In-App Prompt: Team Onboarding Walkthrough'
        WHEN ((activity_score * 0.40) + (engagement_score * 0.30) + (satisfaction_score * 0.30)) >= 85 
            THEN 'Expansion Candidate (Pitch Enterprise Annual License)'
        ELSE 'Standard Weekly Touchpoint'
    END AS recommended_playbook

FROM health_scoring
ORDER BY mrr_amount DESC, health_score ASC;
