# Methods and project scope

This project demonstrates analytics on synthetic subscription records. It does
not describe a client engagement, a deployed company system or measured business
impact. The small fixture has 15 users; the generator can create 2,500.

## Revenue

Monthly snapshots use subscriptions active immediately before the next month
starts. Start dates are inclusive; end dates are exclusive. Canceled accounts
remain in the date spine with zero MRR so their loss is included in the waterfall.

Starting MRR + new/reactivated MRR + expansion - contraction - churn = ending MRR.
NRR includes only accounts with positive starting MRR. It is undefined when the
starting balance is zero. ARR annualizes the ending balance by multiplying by 12.
The final reporting month is the latest month represented by signup, event,
invoice or cancellation dates. Partial final months should be treated cautiously.

The data contains no historical upgrades, downgrades or marketing spend. It
cannot support robust expansion analysis, CAC or LTV/CAC. Invoice failures are
not automatically interpreted as subscription cancellations.

## Product behavior

Retention counts users with any event, including the signup event, within each
calendar month. Its denominator is the full signup cohort. Zero means an observed
month with no events; a blank means the month has not been observed yet.

The funnel enforces timestamp order. The generator does not guarantee that all
users follow that order, so funnel conversion differs from independent feature
adoption. Neither is evidence that inviting teammates causes higher retention.

## Account health and churn

The health score starts at 60 for activity in the last 30 days, or 20 otherwise.
It adds five points per recent event up to 40, subtracts ten per unresolved ticket,
and is clamped to 0-100. Its thresholds are assumptions for demonstration.

The separate churn model uses a 30-day feature window followed by a 90-day outcome
window. It requires a sufficient sample and both classes in training and testing.
Chronological splitting with purged label windows reduces temporal leakage, but
the synthetic process still limits how its scores should be interpreted.

## What would be needed for a real deployment

Subscription change history, a defined reporting cutoff, reconciled billing
records, marketing costs, event validation, data-quality monitoring and an access
model would be needed before using these metrics for business decisions. Claims
about activation lift or churn savings would also need measured intervention
results, rather than calculations on simulated records.
