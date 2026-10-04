# Questions to prepare for

Use these as prompts for understanding the code, rather than a script to memorize.

1. Why is contracted MRR different from invoiced or collected revenue?
2. How does the date spine capture churn in a month with no invoice?
3. Why does NRR exclude new accounts, and when is it undefined?
4. How do zero retention and unobserved retention differ?
5. Why do independent feature counts differ from an ordered funnel?
6. Which events are permitted in the churn model's feature window?
7. What does purging overlapping outcome windows accomplish?
8. Why might a model fail to beat a simple baseline on synthetic data?
9. What does the health score assume, and how would you validate those assumptions?
10. Which parts did you personally implement or change, and what help did you use?

For a walkthrough, start with a subscription cancellation, follow it through the
revenue SQL, and show the regression test. Then explain one cohort row and the
churn feature/outcome windows. State the dataset's limits before discussing results.
