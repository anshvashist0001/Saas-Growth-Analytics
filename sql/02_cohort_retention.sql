-- ==============================================================================
-- 02. SaaS Monthly Cohort Retention Matrix
-- Purpose: Track user retention curves over 12 months for each signup cohort.
--          Produces the classic triangular retention heatmap dataset.
-- Dialect: ANSI SQL / DuckDB / PostgreSQL / Snowflake Compatible
-- ==============================================================================

WITH user_cohorts AS (
    -- Step 1: Establish the baseline cohort month for every user based on their signup date
    SELECT
        user_id,
        DATE_TRUNC('month', signup_date) AS cohort_month
    FROM users
),

monthly_user_activities AS (
    -- Step 2: Extract distinct active months per user from product telemetry events
    SELECT DISTINCT
        user_id,
        DATE_TRUNC('month', event_timestamp) AS activity_month
    FROM product_events
),

cohort_activity_joined AS (
    -- Step 3: Compute the month offset (Period 0, 1, 2, ..., 12) between signup and active month
    SELECT
        c.user_id,
        c.cohort_month,
        a.activity_month,
        -- Calculate the difference in calendar months
        (
            EXTRACT(YEAR FROM a.activity_month) - EXTRACT(YEAR FROM c.cohort_month)
        ) * 12 + (
            EXTRACT(MONTH FROM a.activity_month) - EXTRACT(MONTH FROM c.cohort_month)
        ) AS month_number
    FROM user_cohorts c
    JOIN monthly_user_activities a ON c.user_id = a.user_id
    WHERE a.activity_month >= c.cohort_month
),

cohort_sizes AS (
    -- Step 4: Determine initial cohort size (Month 0 base)
    SELECT
        cohort_month,
        COUNT(DISTINCT user_id) AS total_cohort_users
    FROM user_cohorts
    GROUP BY 1
),

cohort_retention_summary AS (
    -- Step 5: Count active retained users for each cohort across each month index
    SELECT
        j.cohort_month,
        j.month_number,
        COUNT(DISTINCT j.user_id) AS active_users
    FROM cohort_activity_joined j
    GROUP BY 1, 2
)

-- Step 6: Final Output with Retention Percentages for Visualization Heatmaps
SELECT
    s.cohort_month,
    sz.total_cohort_users AS cohort_size,
    s.month_number,
    s.active_users,
    ROUND((s.active_users * 100.0) / sz.total_cohort_users, 2) AS retention_rate_pct
FROM cohort_retention_summary s
JOIN cohort_sizes sz ON s.cohort_month = sz.cohort_month
WHERE s.month_number BETWEEN 0 AND 12
ORDER BY s.cohort_month ASC, s.month_number ASC;
