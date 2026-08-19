/**
 * SaaS Product & Growth Analytics - Core Dataset & Metrics Store
 * Contains comprehensive time-series, cohort matrices, funnel telemetry, and account-level health records.
 */

const SAAS_METRICS = {
    summary: {
        currentARR: 3846000,
        currentMRR: 320500,
        mrrGrowthMoM: 8.4,
        netRevenueRetention: 112.4,
        grossRevenueRetention: 91.2,
        monthlyChurnRate: 2.1,
        activePaidAccounts: 1420,
        totalRegisteredUsers: 12450,
        arpu: 225.70,
        ltv: 4150,
        cac: 1080,
        ltvCacRatio: 3.84,
        cacPaybackMonths: 8.2,
        quickRatio: 3.42,
        activationRate: 34.2
    },

    // 24 Months of SaaS MRR Waterfall
    mrrWaterfall: [
        { month: '2023-01', starting: 120000, newMrr: 18500, expansion: 6200, contraction: 1400, churn: 2800, ending: 140500, nrr: 101.7, quickRatio: 5.88 },
        { month: '2023-02', starting: 140500, newMrr: 19200, expansion: 7100, contraction: 1600, churn: 3100, ending: 162100, nrr: 101.7, quickRatio: 5.60 },
        { month: '2023-03', starting: 162100, newMrr: 21000, expansion: 8400, contraction: 1900, churn: 3400, ending: 186200, nrr: 101.9, quickRatio: 5.55 },
        { month: '2023-04', starting: 186200, newMrr: 22400, expansion: 9200, contraction: 2100, churn: 3900, ending: 211800, nrr: 101.7, quickRatio: 5.27 },
        { month: '2023-05', starting: 211800, newMrr: 23800, expansion: 10500, contraction: 2400, churn: 4200, ending: 239500, nrr: 101.8, quickRatio: 5.20 },
        { month: '2023-06', starting: 239500, newMrr: 24900, expansion: 11800, contraction: 2600, churn: 4800, ending: 268800, nrr: 101.8, quickRatio: 4.96 },
        { month: '2023-07', starting: 268800, newMrr: 26100, expansion: 13200, contraction: 2900, churn: 5200, ending: 300000, nrr: 101.9, quickRatio: 4.85 },
        { month: '2023-08', starting: 300000, newMrr: 27500, expansion: 14600, contraction: 3200, churn: 5800, ending: 333100, nrr: 101.9, quickRatio: 4.68 },
        { month: '2023-09', starting: 333100, newMrr: 28800, expansion: 16100, contraction: 3600, churn: 6400, ending: 368000, nrr: 101.8, quickRatio: 4.49 },
        { month: '2023-10', starting: 368000, newMrr: 30200, expansion: 17800, contraction: 3900, churn: 7100, ending: 405000, nrr: 101.8, quickRatio: 4.36 },
        { month: '2023-11', starting: 405000, newMrr: 31800, expansion: 19500, contraction: 4300, churn: 7800, ending: 444200, nrr: 101.8, quickRatio: 4.24 },
        { month: '2023-12', starting: 444200, newMrr: 33500, expansion: 21400, contraction: 4800, churn: 8500, ending: 485800, nrr: 101.8, quickRatio: 4.13 },
        { month: '2024-01', starting: 195000, newMrr: 24000, expansion: 12500, contraction: 2800, churn: 4100, ending: 224600, nrr: 102.9, quickRatio: 5.29 },
        { month: '2024-02', starting: 224600, newMrr: 25800, expansion: 14200, contraction: 3100, churn: 4600, ending: 256900, nrr: 102.9, quickRatio: 5.19 },
        { month: '2024-03', starting: 256900, newMrr: 27400, expansion: 16100, contraction: 3400, churn: 5200, ending: 291800, nrr: 102.9, quickRatio: 5.06 },
        { month: '2024-04', starting: 291800, newMrr: 29100, expansion: 18000, contraction: 3800, churn: 5800, ending: 329300, nrr: 102.9, quickRatio: 4.91 },
        { month: '2024-05', starting: 329300, newMrr: 30800, expansion: 20200, contraction: 4200, churn: 6400, ending: 369700, nrr: 102.9, quickRatio: 4.81 },
        { month: '2024-06', starting: 369700, newMrr: 32400, expansion: 22500, contraction: 4600, churn: 7100, ending: 412900, nrr: 102.9, quickRatio: 4.69 },
        { month: '2024-07', starting: 412900, newMrr: 34200, expansion: 24800, contraction: 5100, churn: 7800, ending: 459000, nrr: 102.9, quickRatio: 4.57 },
        { month: '2024-08', starting: 459000, newMrr: 36000, expansion: 27400, contraction: 5600, churn: 8600, ending: 508200, nrr: 102.9, quickRatio: 4.46 },
        { month: '2024-09', starting: 508200, newMrr: 37900, expansion: 30100, contraction: 6200, churn: 9400, ending: 560600, nrr: 102.9, quickRatio: 4.36 },
        { month: '2024-10', starting: 560600, newMrr: 39800, expansion: 33000, contraction: 6800, churn: 10300, ending: 616300, nrr: 102.8, quickRatio: 4.26 },
        { month: '2024-11', starting: 616300, newMrr: 41800, expansion: 36200, contraction: 7400, churn: 11200, ending: 675700, nrr: 102.9, quickRatio: 4.19 },
        { month: '2024-12', starting: 295000, newMrr: 32500, expansion: 24800, contraction: 4800, churn: 7000, ending: 340500, nrr: 112.4, quickRatio: 4.86 }
    ],

    // Cohort Retention Heatmap Matrix
    cohorts: [
        { cohort: '2024-01', size: 1040, rates: [100.0, 68.4, 54.2, 47.8, 43.1, 40.5, 38.2, 36.5, 35.1, 34.0, 33.2, 32.5, 31.8] },
        { cohort: '2024-02', size: 1110, rates: [100.0, 69.1, 55.0, 48.4, 44.0, 41.2, 39.0, 37.1, 35.8, 34.6, 33.8, 33.0] },
        { cohort: '2024-03', size: 1185, rates: [100.0, 70.2, 56.1, 49.5, 45.2, 42.4, 40.1, 38.3, 36.9, 35.7, 34.8] },
        { cohort: '2024-04', size: 1250, rates: [100.0, 71.4, 57.5, 50.8, 46.5, 43.8, 41.5, 39.6, 38.2, 37.0] },
        { cohort: '2024-05', size: 1320, rates: [100.0, 72.8, 59.0, 52.1, 48.0, 45.1, 42.9, 41.0, 39.5] },
        { cohort: '2024-06', size: 1395, rates: [100.0, 74.0, 60.5, 53.6, 49.5, 46.7, 44.3, 42.5] },
        { cohort: '2024-07', size: 1470, rates: [100.0, 75.2, 61.8, 55.0, 51.0, 48.2, 45.8] },
        { cohort: '2024-08', size: 1550, rates: [100.0, 76.5, 63.2, 56.4, 52.5, 49.8] },
        { cohort: '2024-09', size: 1630, rates: [100.0, 77.8, 64.6, 58.0, 54.1] },
        { cohort: '2024-10', size: 1720, rates: [100.0, 79.1, 66.0, 59.5] },
        { cohort: '2024-11', size: 1810, rates: [100.0, 80.4, 67.5] },
        { cohort: '2024-12', size: 1910, rates: [100.0, 81.6] }
    ],

    // Product Onboarding Funnel by Channel
    funnel: {
        all: [
            { step: '1. Registered Signups', count: 12450, dropoffPct: 0.0 },
            { step: '2. Completed Workspace Setup', count: 9835, dropoffPct: 21.0 },
            { step: '3. Invited Teammate (Aha!)', count: 4250, dropoffPct: 56.8 },
            { step: '4. Created Analytics Pipeline', count: 3260, dropoffPct: 23.3 },
            { step: '5. Converted to Paid Subscription', count: 1420, dropoffPct: 56.4 }
        ],
        channels: [
            { name: 'Product Hunt / Referral', signups: 1860, conversions: 156, rate: 8.39, cac: 340, ltv: 2108 },
            { name: 'Organic Search / SEO', signups: 4350, conversions: 226, rate: 5.20, cac: 420, ltv: 2016 },
            { name: 'LinkedIn B2B Campaigns', signups: 1870, conversions: 86, rate: 4.60, cac: 1150, ltv: 4140 },
            { name: 'Direct / Word-of-Mouth', signups: 1245, conversions: 52, rate: 4.18, cac: 210, ltv: 1890 },
            { name: 'Google Paid Ads', signups: 3125, conversions: 91, rate: 2.91, cac: 890, ltv: 1869 }
        ]
    },

    // Feature Adoption vs. 90-Day Retention Probability
    featureAdoption: [
        { feature: 'Solo User (0 Team Invites)', retention90d: 18.4, activeDays: 3.2, cohortShare: 54 },
        { feature: '1 Teammate Invited', retention90d: 41.2, activeDays: 7.8, cohortShare: 22 },
        { feature: '2+ Teammates Invited ("Aha!")', retention90d: 78.6, activeDays: 16.4, cohortShare: 24 },
        { feature: 'Custom SQL Alert Configured', retention90d: 74.2, activeDays: 14.1, cohortShare: 28 },
        { feature: 'REST API Connected', retention90d: 71.0, activeDays: 13.5, cohortShare: 31 },
        { feature: 'PDF/CSV Scheduled Export', retention90d: 64.5, activeDays: 11.2, cohortShare: 38 }
    ],

    // Plan Tier Distribution
    planTiers: [
        { tier: 'Free Starter', users: 6850, mrr: 0, share: 55.0, color: '#94A3B8' },
        { tier: 'Growth ($79/mo)', users: 890, mrr: 70310, share: 21.9, color: '#3B82F6' },
        { tier: 'Pro Team ($199/mo)', users: 380, mrr: 75620, share: 23.6, color: '#10B981' },
        { tier: 'Enterprise ($699/mo)', users: 150, mrr: 104850, share: 32.7, color: '#8B5CF6' }
    ],

    // Account Health & Churn Risk Table
    accounts: [
        { id: 'USR-00001', company: 'Apex FinTech Global', plan: 'Enterprise', mrr: 699, lastActiveDays: 1, activeDays30d: 22, tickets: 0, csat: 5.0, healthScore: 96, risk: 'Low Risk', playbook: 'Expansion Candidate (Pitch Annual Multi-Year)' },
        { id: 'USR-00005', company: 'Nexus BioHealth AI', plan: 'Enterprise', mrr: 699, lastActiveDays: 2, activeDays30d: 19, tickets: 0, csat: 4.8, healthScore: 92, risk: 'Low Risk', playbook: 'Standard Weekly Executive Check-in' },
        { id: 'USR-00014', company: 'Hyperion DevTools Inc', plan: 'Enterprise', mrr: 699, lastActiveDays: 4, activeDays30d: 16, tickets: 1, csat: 4.5, healthScore: 88, risk: 'Low Risk', playbook: 'Standard Bi-weekly CS Review' },
        { id: 'USR-00002', company: 'Crestline Logistics HQ', plan: 'Pro Team', mrr: 199, lastActiveDays: 6, activeDays30d: 11, tickets: 0, csat: 4.2, healthScore: 78, risk: 'Low Risk', playbook: 'Share Advanced Dashboard Templates' },
        { id: 'USR-00009', company: 'Solstice Media Partners', plan: 'Pro Team', mrr: 199, lastActiveDays: 8, activeDays30d: 8, tickets: 1, csat: 3.8, healthScore: 68, risk: 'Medium Risk', playbook: 'Schedule Dedicated Account Review' },
        { id: 'USR-00012', company: 'VectorPay FinTech', plan: 'Pro Team', mrr: 199, lastActiveDays: 12, activeDays30d: 4, tickets: 2, csat: 3.0, healthScore: 52, risk: 'Medium Risk', playbook: 'Proactive Outreach: Onboarding Refresh' },
        { id: 'USR-00006', company: 'OmniGrowth MarTech', plan: 'Pro Team', mrr: 199, lastActiveDays: 24, activeDays30d: 1, tickets: 3, csat: 2.1, healthScore: 32, risk: 'High Risk', playbook: '🚨 URGENT: Executive Outreach & Issue Resolution' },
        { id: 'USR-00010', company: 'Zephyr Health Systems', plan: 'Growth', mrr: 79, lastActiveDays: 19, activeDays30d: 2, tickets: 2, csat: 2.5, healthScore: 38, risk: 'High Risk', playbook: '🚨 Trigger Automated Re-engagement Workflow' },
        { id: 'USR-00007', company: 'Starlight EdTech Labs', plan: 'Growth', mrr: 79, lastActiveDays: 5, activeDays30d: 9, tickets: 0, csat: 4.0, healthScore: 75, risk: 'Low Risk', playbook: 'Recommend Team Collaboration Features' },
        { id: 'USR-00013', company: 'Vanguard Cyber Defense', plan: 'Growth', mrr: 79, lastActiveDays: 7, activeDays30d: 7, tickets: 1, csat: 3.5, healthScore: 65, risk: 'Medium Risk', playbook: 'Send Customer Success Best Practice Guide' },
        { id: 'USR-00015', company: 'Beacon Retail Intelligence', plan: 'Growth', mrr: 79, lastActiveDays: 16, activeDays30d: 2, tickets: 2, csat: 2.8, healthScore: 42, risk: 'High Risk', playbook: '🚨 Assign Specialist for 1-on-1 Support Call' }
    ],

    // SQL Studio Pre-loaded Queries
    sqlStudioQueries: [
        {
            id: 'mrr_waterfall',
            name: '01. Monthly MRR Waterfall & NRR Calculation',
            description: 'Calculates MoM starting MRR, new MRR, expansion, contraction, churn, and Net Revenue Retention % using LAG window functions.',
            sql: `WITH monthly_user_mrr AS (
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
mrr_lag AS (
    SELECT rev_month, user_id, current_mrr,
           LAG(current_mrr, 1, 0.0) OVER (PARTITION BY user_id ORDER BY rev_month) AS previous_mrr
    FROM monthly_user_mrr
)
SELECT 
    rev_month,
    ROUND(SUM(previous_mrr), 2) AS starting_mrr,
    ROUND(SUM(CASE WHEN previous_mrr = 0 THEN current_mrr ELSE 0 END), 2) AS new_mrr,
    ROUND(SUM(CASE WHEN previous_mrr > 0 AND current_mrr > previous_mrr THEN (current_mrr - previous_mrr) ELSE 0 END), 2) AS expansion_mrr,
    ROUND(SUM(CASE WHEN previous_mrr > 0 AND current_mrr < previous_mrr AND current_mrr > 0 THEN (previous_mrr - current_mrr) ELSE 0 END), 2) AS contraction_mrr,
    ROUND(SUM(CASE WHEN previous_mrr > 0 AND current_mrr = 0 THEN previous_mrr ELSE 0 END), 2) AS churn_mrr,
    ROUND(SUM(current_mrr), 2) AS ending_mrr,
    ROUND((SUM(current_mrr) / NULLIF(SUM(previous_mrr), 0)) * 100, 2) AS nrr_pct
FROM mrr_lag
GROUP BY 1
ORDER BY rev_month DESC
LIMIT 6;`,
            results: [
                { rev_month: '2024-12', starting_mrr: '$295,000', new_mrr: '$32,500', expansion_mrr: '$24,800', contraction_mrr: '$4,800', churn_mrr: '$7,000', ending_mrr: '$340,500', nrr_pct: '112.4%' },
                { rev_month: '2024-11', starting_mrr: '$268,000', new_mrr: '$30,100', expansion_mrr: '$22,400', contraction_mrr: '$4,200', churn_mrr: '$6,300', ending_mrr: '$310,000', nrr_pct: '111.8%' },
                { rev_month: '2024-10', starting_mrr: '$244,000', new_mrr: '$28,400', expansion_mrr: '$20,100', contraction_mrr: '$3,900', churn_mrr: '$5,600', ending_mrr: '$283,000', nrr_pct: '111.2%' },
                { rev_month: '2024-09', starting_mrr: '$222,000', new_mrr: '$26,200', expansion_mrr: '$18,500', contraction_mrr: '$3,600', churn_mrr: '$5,100', ending_mrr: '$258,000', nrr_pct: '110.8%' },
                { rev_month: '2024-08', starting_mrr: '$202,000', new_mrr: '$24,500', expansion_mrr: '$16,800', contraction_mrr: '$3,200', churn_mrr: '$4,600', ending_mrr: '$235,500', nrr_pct: '110.4%' }
            ]
        },
        {
            id: 'cohort_retention',
            name: '02. Triangular Cohort Retention Matrix',
            description: 'Computes monthly retention percentages by cohort signup month.',
            sql: `WITH user_cohorts AS (
    SELECT user_id, DATE_TRUNC('month', signup_date) AS cohort_month
    FROM users
),
activity AS (
    SELECT DISTINCT user_id, DATE_TRUNC('month', event_timestamp) AS active_month
    FROM product_events
)
SELECT 
    c.cohort_month,
    COUNT(DISTINCT c.user_id) AS cohort_size,
    ROUND(COUNT(DISTINCT CASE WHEN DATEDIFF('month', c.cohort_month, a.active_month) = 0 THEN a.user_id END) * 100.0 / COUNT(DISTINCT c.user_id), 1) AS m0_pct,
    ROUND(COUNT(DISTINCT CASE WHEN DATEDIFF('month', c.cohort_month, a.active_month) = 1 THEN a.user_id END) * 100.0 / COUNT(DISTINCT c.user_id), 1) AS m1_pct,
    ROUND(COUNT(DISTINCT CASE WHEN DATEDIFF('month', c.cohort_month, a.active_month) = 3 THEN a.user_id END) * 100.0 / COUNT(DISTINCT c.user_id), 1) AS m3_pct,
    ROUND(COUNT(DISTINCT CASE WHEN DATEDIFF('month', c.cohort_month, a.active_month) = 6 THEN a.user_id END) * 100.0 / COUNT(DISTINCT c.user_id), 1) AS m6_pct,
    ROUND(COUNT(DISTINCT CASE WHEN DATEDIFF('month', c.cohort_month, a.active_month) = 12 THEN a.user_id END) * 100.0 / COUNT(DISTINCT c.user_id), 1) AS m12_pct
FROM user_cohorts c
JOIN activity a ON c.user_id = a.user_id
GROUP BY 1
ORDER BY cohort_month DESC
LIMIT 6;`,
            results: [
                { cohort_month: '2024-06', cohort_size: '1,395', m0_pct: '100.0%', m1_pct: '74.0%', m3_pct: '53.6%', m6_pct: '44.3%', m12_pct: '-' },
                { cohort_month: '2024-05', cohort_size: '1,320', m0_pct: '100.0%', m1_pct: '72.8%', m3_pct: '52.1%', m6_pct: '42.9%', m12_pct: '-' },
                { cohort_month: '2024-04', cohort_size: '1,250', m0_pct: '100.0%', m1_pct: '71.4%', m3_pct: '50.8%', m6_pct: '41.5%', m12_pct: '-' },
                { cohort_month: '2024-03', cohort_size: '1,185', m0_pct: '100.0%', m1_pct: '70.2%', m3_pct: '49.5%', m6_pct: '40.1%', m12_pct: '-' },
                { cohort_month: '2024-02', cohort_size: '1,110', m0_pct: '100.0%', m1_pct: '69.1%', m3_pct: '48.4%', m6_pct: '39.0%', m12_pct: '33.0%' },
                { cohort_month: '2024-01', cohort_size: '1,040', m0_pct: '100.0%', m1_pct: '68.4%', m3_pct: '47.8%', m6_pct: '38.2%', m12_pct: '31.8%' }
            ]
        },
        {
            id: 'churn_risk',
            name: '03. High Churn Risk Accounts & Prescriptive Playbooks',
            description: 'Identifies accounts with composite Health Score < 50 and prescribes corrective action.',
            sql: `SELECT 
    u.user_id,
    u.company_name,
    s.plan_tier,
    s.mrr_amount,
    DATEDIFF('day', MAX(e.event_timestamp), CURRENT_DATE) AS days_inactive,
    COUNT(CASE WHEN t.ticket_status = 'open' THEN 1 END) AS open_tickets,
    ROUND((activity_score * 0.40) + (engagement_score * 0.30) + (satisfaction_score * 0.30), 0) AS health_score,
    CASE 
        WHEN health_score < 50 AND days_inactive > 14 THEN 'Trigger Automated Re-engagement Workflow'
        WHEN health_score < 50 AND open_tickets >= 2 THEN 'Escalate to Senior Solutions Engineer'
        ELSE 'Proactive CSM Outreach'
    END AS prescriptive_action
FROM users u
JOIN subscriptions s ON u.user_id = s.user_id AND s.status = 'active'
LEFT JOIN product_events e ON u.user_id = e.user_id
LEFT JOIN support_tickets t ON u.user_id = t.user_id
GROUP BY 1, 2, 3, 4
HAVING health_score < 50
ORDER BY s.mrr_amount DESC;`,
            results: [
                { user_id: 'USR-00006', company_name: 'OmniGrowth MarTech', plan_tier: 'Pro Team', mrr_amount: '$199.00', days_inactive: '24', open_tickets: '3', health_score: '32', prescriptive_action: '🚨 URGENT: Executive Outreach & Issue Resolution' },
                { user_id: 'USR-00010', company_name: 'Zephyr Health Systems', plan_tier: 'Growth', mrr_amount: '$79.00', days_inactive: '19', open_tickets: '2', health_score: '38', prescriptive_action: '🚨 Trigger Automated Re-engagement Workflow' },
                { user_id: 'USR-00015', company_name: 'Beacon Retail Intelligence', plan_tier: 'Growth', mrr_amount: '$79.00', days_inactive: '16', open_tickets: '2', health_score: '42', prescriptive_action: '🚨 Assign Specialist for 1-on-1 Support Call' }
            ]
        }
    ]
};
