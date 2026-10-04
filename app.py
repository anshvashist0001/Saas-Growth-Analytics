from pathlib import Path
import streamlit as st
import plotly.express as px
from analytics import load_tables, summary, monthly_revenue, retention, funnel, health, run_sql_file, connection

st.set_page_config(page_title='SaaS growth analytics',layout='wide')
st.title('SaaS growth analytics')
st.caption('A portfolio exercise using synthetic data. Every metric below is calculated from the loaded CSVs.')


@st.cache_data(max_entries=2)
def datasets(signatures):
    return load_tables()


root = Path(__file__).resolve().parent
signatures = tuple((p.name,p.stat().st_mtime_ns) for p in sorted((root/'data').glob('*.csv')))
tables = datasets(signatures)
metrics = summary(tables)
st.caption(f"Month-end reporting period: {metrics['as_of'][:7]} · {metrics['users']:,} user records")
view = st.sidebar.selectbox('View',['Revenue','Retention','Activation','Account health','SQL studio','Methods'])

if view == 'Revenue':
    with st.container(horizontal=True):
        st.metric('Contracted MRR',f"${metrics['mrr']:,.0f}",border=True)
        st.metric('Annualized ARR',f"${metrics['arr']:,.0f}",border=True)
        st.metric('Active paid accounts',metrics['active_accounts'],border=True)
        st.metric('NRR','N/A' if metrics['nrr_pct'] is None else f"{metrics['nrr_pct']:.1f}%",border=True)
    revenue = monthly_revenue(tables)
    st.line_chart(revenue,x='month',y='ending_mrr',alt='Month-end contracted recurring revenue')
    st.subheader('MRR movements')
    st.dataframe(revenue,hide_index=True,alt='Monthly revenue reconciliation and churn rates')
    st.download_button('Download revenue CSV',revenue.to_csv(index=False),'monthly_revenue.csv','text/csv')
    st.caption('MRR measures contracted subscriptions, not cash collections. New MRR also includes reactivations. The dataset has fixed prices and no upgrade history; expansion and contraction may be zero.')
elif view == 'Retention':
    matrix = retention(tables)
    chart = px.imshow(matrix.to_numpy(),x=[f'M{i}' for i in matrix.columns],
                      y=matrix.index.astype(str),zmin=0,zmax=100,labels={'color':'Active users (%)'})
    st.plotly_chart(chart,alt='Signup cohorts and monthly event activity retention')
    st.dataframe(matrix,alt='Cohort retention percentages')
    st.caption('Denominator: all users signing up in each cohort. Activity: at least one product event in the month. Observed months without activity are zero; future months are blank. Recent months can be incomplete.')
elif view == 'Activation':
    counts = funnel(tables)
    st.bar_chart(counts,x='stage',y='users',horizontal=True,alt='Ordered onboarding funnel user counts')
    st.dataframe(counts,hide_index=True,alt='Ordered activation stages')
    adoption = run_sql_file(tables,'04_feature_adoption.sql')
    st.subheader('Feature adoption')
    st.dataframe(adoption,hide_index=True,alt='Distinct users using each feature')
    st.caption('The funnel enforces event order. Feature counts are independent of the funnel. Associations in synthetic data do not establish causal retention improvements.')
elif view == 'Account health':
    rows = health(tables)
    query = st.text_input('Search company or account')
    if query:
        rows = rows[rows.company_name.str.contains(query,case=False,regex=False) | rows.user_id.str.contains(query,case=False,regex=False)]
    st.dataframe(rows,hide_index=True,alt='Active accounts and heuristic health scores')
    st.caption('Heuristic: 60 points for activity within 30 days, otherwise 20; add 5 per recent event up to 40; subtract 10 per unresolved ticket. Clamp to 0–100. This is not a churn probability.')
elif view == 'SQL studio':
    files = sorted((root/'sql').glob('*.sql'))
    selected = st.selectbox('Example query',[p.name for p in files])
    with st.form('sql_query'):
        sql = st.text_area('DuckDB SQL', (root/'sql'/selected).read_text(),height=300,key=f'sql_{selected}')
        submitted = st.form_submit_button('Run query')
    if submitted:
        try:
            with connection(tables) as con:
                parsed = con.extract_statements(sql)
                if len(parsed)!=1 or parsed[0].type.name!='SELECT':
                    raise ValueError('Enter one SELECT query.')
                # This is a local exercise, not a public multi-user SQL service.
                result = con.execute(sql).df()
            st.dataframe(result,hide_index=True,alt='Executed SQL query results')
            st.caption(f'{len(result):,} rows returned')
        except Exception as exc:
            st.error(str(exc))
    st.caption('Run locally with trusted queries. The SELECT check is not a security sandbox; DuckDB can access local files through table functions.')
else:
    st.markdown((root/'docs'/'PROJECT_EXECUTIVE_SUMMARY.md').read_text(encoding='utf-8'))
