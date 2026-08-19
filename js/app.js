/**
 * SaaS Growth Intelligence - Main Application Controller
 * Handles tab navigation, interactive SQL studio execution, filtering, and event listeners.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Navigation & Tab Switching
    const navItems = document.querySelectorAll('.nav-item');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const pageTitle = document.getElementById('pageTitle');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = item.getAttribute('data-tab');

            navItems.forEach(n => n.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            item.classList.add('active');
            const activePane = document.getElementById(targetTab);
            if (activePane) activePane.classList.add('active');

            // Update page header title
            const tabTitleMap = {
                'overview': '📊 Executive Revenue & Unit Economics',
                'cohorts': '👥 12-Month Cohort Retention Matrix',
                'funnel': '🔄 Product Activation Funnel & "Aha!" Discovery',
                'churn': '⚠️ Customer Health & Churn Prevention Hub',
                'sql-studio': '💻 Live SQL Query Sandbox & Data Explorer',
                'strategy': '📄 Executive Strategy & Business ROI Recommendations'
            };
            if (pageTitle && tabTitleMap[targetTab]) {
                pageTitle.textContent = tabTitleMap[targetTab];
            }

            // Trigger specific chart renders on first view
            if (targetTab === 'cohorts') ChartsEngine.renderCohortHeatmap();
            if (targetTab === 'funnel') ChartsEngine.renderFunnelAndAdoption();
            if (targetTab === 'churn') ChartsEngine.renderAccountHealthTable();
        });
    });

    // 2. Initialize Overview Tab Charts
    ChartsEngine.initRevenueCharts();

    // 3. SQL Studio Functionality
    const querySelect = document.getElementById('querySelect');
    const sqlCodeArea = document.getElementById('sqlCodeArea');
    const runSqlBtn = document.getElementById('runSqlBtn');
    const sqlQueryDescription = document.getElementById('sqlQueryDescription');
    const sqlResultsTableHead = document.getElementById('sqlResultsTableHead');
    const sqlResultsTableBody = document.getElementById('sqlResultsTableBody');
    const sqlExecutionMeta = document.getElementById('sqlExecutionMeta');

    function loadSelectedQuery(queryId) {
        const found = SAAS_METRICS.sqlStudioQueries.find(q => q.id === queryId);
        if (found) {
            sqlCodeArea.value = found.sql;
            sqlQueryDescription.textContent = found.description;
            renderSqlResults(found.results);
        }
    }

    function renderSqlResults(results) {
        if (!results || results.length === 0) return;
        const columns = Object.keys(results[0]);
        
        // Render Header
        sqlResultsTableHead.innerHTML = `<tr>${columns.map(col => `<th>${col.toUpperCase()}</th>`).join('')}</tr>`;
        
        // Render Rows
        sqlResultsTableBody.innerHTML = results.map(row => {
            return `<tr>${columns.map(col => `<td>${row[col]}</td>`).join('')}</tr>`;
        }).join('');
    }

    if (querySelect) {
        querySelect.addEventListener('change', (e) => {
            loadSelectedQuery(e.target.value);
        });
        // Initial load
        loadSelectedQuery('mrr_waterfall');
    }

    if (runSqlBtn) {
        runSqlBtn.addEventListener('click', () => {
            runSqlBtn.innerHTML = `⏳ Executing Query...`;
            runSqlBtn.disabled = true;
            
            setTimeout(() => {
                const queryId = querySelect.value;
                const found = SAAS_METRICS.sqlStudioQueries.find(q => q.id === queryId);
                const randomTime = (Math.random() * 18 + 12).toFixed(1);
                
                if (found) {
                    renderSqlResults(found.results);
                    sqlExecutionMeta.innerHTML = `<span class="badge badge-success">✓ Success</span> <strong>${found.results.length} rows returned</strong> in ${randomTime}ms`;
                }
                
                runSqlBtn.innerHTML = `▶ Run SQL Query`;
                runSqlBtn.disabled = false;
            }, 350);
        });
    }

    // 4. Account Health Search Filter
    const accountSearchInput = document.getElementById('accountSearchInput');
    if (accountSearchInput) {
        accountSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#accountHealthTableBody tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(query) ? '' : 'none';
            });
        });
    }

    // 5. Export Report simulation
    const exportBtn = document.getElementById('exportReportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            window.print();
        });
    }
});
