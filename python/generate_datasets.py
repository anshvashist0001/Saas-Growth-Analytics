"""
SaaS Growth Analytics - Data Generator Script
Generates deterministic, highly realistic relational datasets for a B2B SaaS platform:
- users.csv
- subscriptions.csv
- product_events.csv
- invoices.csv
- support_tickets.csv
"""

import os
import random
import csv
from datetime import datetime, timedelta

# Set fixed seed for reproducibility
random.seed(42)

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
os.makedirs(DATA_DIR, exist_ok=True)

# Configurations
NUM_USERS = 2500
START_DATE = datetime(2023, 1, 1)
END_DATE = datetime(2024, 12, 31)
TOTAL_DAYS = (END_DATE - START_DATE).days

CHANNELS = ['Organic Search', 'Google Paid Ads', 'Product Hunt / Referral', 'LinkedIn B2B', 'Direct / Word-of-Mouth']
CHANNEL_WEIGHTS = [0.35, 0.25, 0.15, 0.15, 0.10]

TIERS = {
    'Free Starter': {'mrr': 0, 'weight': 0.55},
    'Growth': {'mrr': 79, 'weight': 0.25},
    'Pro Team': {'mrr': 199, 'weight': 0.14},
    'Enterprise': {'mrr': 699, 'weight': 0.06}
}

INDUSTRIES = ['FinTech', 'E-Commerce', 'Healthcare AI', 'MarTech', 'EdTech', 'DevTools', 'Logistics']
COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-1000', '1000+']
COUNTRIES = ['United States', 'United Kingdom', 'Germany', 'Canada', 'India', 'France', 'Australia', 'Singapore']

print("Generating synthetic SaaS data...")

# 1. Generate Users
users = []
for i in range(1, NUM_USERS + 1):
    user_id = f"USR-{i:05d}"
    signup_offset = random.randint(0, TOTAL_DAYS - 30)
    signup_date = START_DATE + timedelta(days=signup_offset)
    channel = random.choices(CHANNELS, weights=CHANNEL_WEIGHTS)[0]
    tier_choice = random.choices(list(TIERS.keys()), weights=[t['weight'] for t in TIERS.values()])[0]
    
    company_name = f"Venture_{i} {random.choice(['Labs', 'Technologies', 'Data', 'Systems', 'Global', 'HQ'])}"
    company_size = random.choice(COMPANY_SIZES)
    industry = random.choice(INDUSTRIES)
    country = random.choice(COUNTRIES)
    
    users.append({
        'user_id': user_id,
        'company_name': company_name,
        'signup_date': signup_date.strftime('%Y-%m-%d %H:%M:%S'),
        'acquisition_channel': channel,
        'plan_tier': tier_choice,
        'company_size': company_size,
        'industry': industry,
        'country': country
    })

# Write users.csv
with open(os.path.join(DATA_DIR, 'users.csv'), 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=users[0].keys())
    writer.writeheader()
    writer.writerows(users)

print(f"Generated {len(users)} users.")

# 2. Generate Subscriptions & Invoices
subscriptions = []
invoices = []
sub_id_counter = 1
inv_id_counter = 1

for u in users:
    tier = u['plan_tier']
    if tier == 'Free Starter':
        continue
    
    signup_dt = datetime.strptime(u['signup_date'], '%Y-%m-%d %H:%M:%S')
    start_date = signup_dt + timedelta(days=random.randint(1, 14))
    mrr = TIERS[tier]['mrr']
    
    # Determine churn status
    # Paid users from Enterprise churn less (5%), Growth churns more (20%)
    churn_prob = 0.08 if tier == 'Enterprise' else (0.12 if tier == 'Pro Team' else 0.22)
    is_churned = random.random() < churn_prob
    
    if is_churned:
        months_active = random.randint(1, 10)
        end_date = start_date + timedelta(days=months_active * 30)
        status = 'canceled'
    else:
        end_date = None
        status = 'active'
    
    sub_id = f"SUB-{sub_id_counter:05d}"
    sub_id_counter += 1
    
    subscriptions.append({
        'subscription_id': sub_id,
        'user_id': u['user_id'],
        'plan_tier': tier,
        'billing_cycle': 'monthly',
        'mrr_amount': mrr,
        'status': status,
        'start_date': start_date.strftime('%Y-%m-%d %H:%M:%S'),
        'end_date': end_date.strftime('%Y-%m-%d %H:%M:%S') if end_date else ''
    })
    
    # Generate monthly invoices
    curr_date = start_date
    limit_date = end_date if end_date and end_date < END_DATE else END_DATE
    while curr_date <= limit_date:
        inv_id = f"INV-{inv_id_counter:06d}"
        inv_id_counter += 1
        invoices.append({
            'invoice_id': inv_id,
            'subscription_id': sub_id,
            'payment_date': curr_date.strftime('%Y-%m-%d %H:%M:%S'),
            'amount': mrr,
            'payment_status': 'paid' if random.random() > 0.02 else 'failed'
        })
        curr_date += timedelta(days=30)

with open(os.path.join(DATA_DIR, 'subscriptions.csv'), 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=subscriptions[0].keys())
    writer.writeheader()
    writer.writerows(subscriptions)

with open(os.path.join(DATA_DIR, 'invoices.csv'), 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=invoices[0].keys())
    writer.writeheader()
    writer.writerows(invoices)

print(f"Generated {len(subscriptions)} subscriptions and {len(invoices)} invoices.")

# 3. Generate Product Events (Telemetry)
events = []
event_id_counter = 1

CORE_EVENTS = [
    ('completed_workspace_setup', 0.82),
    ('invited_teammate', 0.46),
    ('created_analytics_dashboard', 0.58),
    ('integrated_third_party_api', 0.31),
    ('exported_csv_pdf_report', 0.42),
    ('set_scheduled_alert', 0.28),
    ('viewed_financial_kpis', 0.75)
]

for u in users:
    signup_dt = datetime.strptime(u['signup_date'], '%Y-%m-%d %H:%M:%S')
    user_id = u['user_id']
    tier = u['plan_tier']
    
    # Initial signup event
    events.append({
        'event_id': f"EVT-{event_id_counter:07d}",
        'user_id': user_id,
        'event_name': 'signed_up',
        'event_timestamp': signup_dt.strftime('%Y-%m-%d %H:%M:%S')
    })
    event_id_counter += 1
    
    # Onboarding and regular activity
    is_active_user = (tier != 'Free Starter') or (random.random() < 0.35)
    activity_months = 18 if is_active_user else random.randint(1, 3)
    
    # Event progression
    for evt_name, base_prob in CORE_EVENTS:
        prob = base_prob * (1.3 if tier in ['Enterprise', 'Pro Team'] else 0.8)
        if random.random() < prob:
            delay_hours = random.randint(1, 72)
            evt_time = signup_dt + timedelta(hours=delay_hours)
            events.append({
                'event_id': f"EVT-{event_id_counter:07d}",
                'user_id': user_id,
                'event_name': evt_name,
                'event_timestamp': evt_time.strftime('%Y-%m-%d %H:%M:%S')
            })
            event_id_counter += 1
            
            # Repeat usage events over time for retained users
            if is_active_user:
                for month in range(1, activity_months):
                    evt_time_recurring = signup_dt + timedelta(days=month * 30 + random.randint(1, 28))
                    if evt_time_recurring < END_DATE:
                        events.append({
                            'event_id': f"EVT-{event_id_counter:07d}",
                            'user_id': user_id,
                            'event_name': evt_name,
                            'event_timestamp': evt_time_recurring.strftime('%Y-%m-%d %H:%M:%S')
                        })
                        event_id_counter += 1

with open(os.path.join(DATA_DIR, 'product_events.csv'), 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=events[0].keys())
    writer.writeheader()
    writer.writerows(events)

print(f"Generated {len(events)} product telemetry events.")

# 4. Generate Support Tickets
tickets = []
ticket_id_counter = 1
TICKET_CATEGORIES = ['Billing & Invoices', 'API Integration Error', 'Dashboard Query Timeout', 'Feature Request', 'User Access & Permissions']

for u in users:
    user_id = u['user_id']
    # Chance of having support interaction
    num_tickets = random.choices([0, 1, 2, 3], weights=[0.65, 0.22, 0.09, 0.04])[0]
    signup_dt = datetime.strptime(u['signup_date'], '%Y-%m-%d %H:%M:%S')
    
    for _ in range(num_tickets):
        ticket_dt = signup_dt + timedelta(days=random.randint(5, 180))
        if ticket_dt > END_DATE:
            continue
        category = random.choice(TICKET_CATEGORIES)
        csat = random.choices([5, 4, 3, 2, 1], weights=[0.45, 0.30, 0.12, 0.08, 0.05])[0]
        status = random.choices(['resolved', 'closed', 'open', 'escalated'], weights=[0.75, 0.15, 0.07, 0.03])[0]
        
        tickets.append({
            'ticket_id': f"TCK-{ticket_id_counter:05d}",
            'user_id': user_id,
            'category': category,
            'ticket_status': status,
            'csat_score': csat,
            'resolution_time_hours': random.randint(1, 48),
            'created_at': ticket_dt.strftime('%Y-%m-%d %H:%M:%S')
        })
        ticket_id_counter += 1

with open(os.path.join(DATA_DIR, 'support_tickets.csv'), 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=tickets[0].keys())
    writer.writeheader()
    writer.writerows(tickets)

print(f"Generated {len(tickets)} support tickets.")
print("All SaaS datasets successfully generated in data/ folder!")
