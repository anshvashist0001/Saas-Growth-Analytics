-- ==============================================================================
-- 01. SaaS MRR (Monthly Recurring Revenue) & ARR Waterfall Breakdown
-- Purpose: Calculate MoM MRR movements including New MRR, Expansion MRR, 
--          Contraction MRR, Churned MRR, Net New MRR, and Net Revenue Retention (NRR).
-- Dialect: ANSI SQL / DuckDB / PostgreSQL / Snowflake / BigQuery Compatible
-- ==============================================================================

WITH monthly_user_mrr AS (
    -- Step 1: Calculate the MRR per user for each calendar month
    SELECT 
        DATE_TRUNC('month', i.payment_date) AS rev_month,
        s.user_id,
        s.plan_tier,
        SUM(s.mrr_amount) AS current_mrr
    FROM subscriptions s
    JOIN invoices i ON s.subscription_id = i.subscription_id
    WHERE i.payment_status = 'paid'
    GROUP BY 1, 2, 3
),

mrr_with_lag AS (
    -- Step 2: Track previous month MRR to detect customer upgrades, downgrades, and new signups
    SELECT
        rev_month,
        user_id,
        plan_tier,
        current_mrr,
        LAG(current_mrr, 1, 0.0) OVER (
            PARTITION BY user_id 
            ORDER BY rev_month
        ) AS previous_mrr
    FROM monthly_user_mrr
),

mrr_movements AS (
    -- Step 3: Classify each customer month into SaaS revenue movement categories
    SELECT
        rev_month,
        user_id,
        current_mrr,
        previous_mrr,
        CASE 
            WHEN previous_mrr = 0.0 AND current_mrr > 0 THEN current_mrr 
            ELSE 0.0 
        END AS new_mrr,
        
        CASE 
            WHEN previous_mrr > 0 AND current_mrr > previous_mrr THEN (current_mrr - previous_mrr) 
            ELSE 0.0 
        END AS expansion_mrr,
        
        CASE 
            WHEN previous_mrr > 0 AND current_mrr < previous_mrr AND current_mrr > 0 THEN (previous_mrr - current_mrr) 
            ELSE 0.0 
        END AS contraction_mrr,
        
        CASE 
            WHEN previous_mrr > 0 AND current_mrr = 0 THEN previous_mrr 
            ELSE 0.0 
        END AS churn_mrr
    FROM mrr_with_lag
)

-- Step 4: Aggregate to Monthly Executive Level Summary with Net Revenue Retention (NRR)
SELECT
    rev_month,
    ROUND(SUM(previous_mrr), 2) AS starting_mrr,
    ROUND(SUM(new_mrr), 2) AS new_mrr,
    ROUND(SUM(expansion_mrr), 2) AS expansion_mrr,
    ROUND(SUM(contraction_mrr), 2) AS contraction_mrr,
    ROUND(SUM(churn_mrr), 2) AS churn_mrr,
    ROUND(SUM(current_mrr), 2) AS ending_mrr,
    ROUND(SUM(current_mrr) * 12, 2) AS ending_arr,
    
    -- Net New MRR = (New MRR + Expansion MRR) - (Contraction MRR + Churn MRR)
    ROUND(SUM(new_mrr + expansion_mrr - contraction_mrr - churn_mrr), 2) AS net_new_mrr,
    
    -- Net Revenue Retention (NRR) % = (Ending MRR from existing cohort / Starting MRR) * 100
    ROUND(
        CASE 
            WHEN SUM(previous_mrr) > 0 THEN 
                ((SUM(previous_mrr) + SUM(expansion_mrr) - SUM(contraction_mrr) - SUM(churn_mrr)) / SUM(previous_mrr)) * 100 
            ELSE 100.0 
        END, 2
    ) AS nrr_percentage,
    
    -- SaaS Quick Ratio = (New MRR + Expansion MRR) / (Contraction MRR + Churn MRR)
    ROUND(
        CASE 
            WHEN (SUM(contraction_mrr) + SUM(churn_mrr)) > 0 THEN 
                (SUM(new_mrr) + SUM(expansion_mrr)) / (SUM(contraction_mrr) + SUM(churn_mrr))
            ELSE 99.9 
        END, 2
    ) AS quick_ratio

FROM mrr_movements
GROUP BY 1
ORDER BY rev_month ASC;
