/**
 * SaaS Growth Intelligence - Chart Rendering Engine
 * Builds responsive, high-fidelity Chart.js and SVG data visualizations.
 */

const ChartsEngine = {
    instances: {},

    // 1. Initialize Executive Revenue Charts
    initRevenueCharts() {
        const mrrCtx = document.getElementById('mrrWaterfallChart')?.getContext('2d');
        if (mrrCtx) {
            const last12 = SAAS_METRICS.mrrWaterfall.slice(-12);
            const labels = last12.map(d => d.month);
            
            this.instances.mrrWaterfall = new Chart(mrrCtx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        { label: 'New MRR', data: last12.map(d => d.newMrr), backgroundColor: '#10B981', borderRadius: 4 },
                        { label: 'Expansion MRR', data: last12.map(d => d.expansion), backgroundColor: '#3B82F6', borderRadius: 4 },
                        { label: 'Contraction MRR', data: last12.map(d => -d.contraction), backgroundColor: '#F59E0B', borderRadius: 4 },
                        { label: 'Churn MRR', data: last12.map(d => -d.churn), backgroundColor: '#EF4444', borderRadius: 4 }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { stacked: true, grid: { color: '#334155' }, ticks: { color: '#94A3B8' } },
                        y: { 
                            stacked: true, 
                            grid: { color: '#334155' }, 
                            ticks: { 
                                color: '#94A3B8',
                                callback: val => `$${(val / 1000).toFixed(0)}k`
                            } 
                        }
                    },
                    plugins: {
                        legend: { position: 'top', labels: { color: '#F8FAFC', boxWidth: 12 } },
                        tooltip: {
                            callbacks: {
                                label: ctx => `${ctx.dataset.label}: $${Math.abs(ctx.raw).toLocaleString()}`
                            }
                        }
                    }
                }
            });
        }

        // Plan Tier Doughnut
        const tierCtx = document.getElementById('planTierChart')?.getContext('2d');
        if (tierCtx) {
            this.instances.planTier = new Chart(tierCtx, {
                type: 'doughnut',
                data: {
                    labels: SAAS_METRICS.planTiers.map(t => t.tier),
                    datasets: [{
                        data: SAAS_METRICS.planTiers.map(t => t.mrr || t.users),
                        backgroundColor: SAAS_METRICS.planTiers.map(t => t.color),
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: { position: 'right', labels: { color: '#F8FAFC', boxWidth: 12 } }
                    }
                }
            });
        }
    },

    // 2. Cohort Retention Heatmap Builder
    renderCohortHeatmap() {
        const tableBody = document.getElementById('cohortTableBody');
        if (!tableBody) return;

        let html = '';
        SAAS_METRICS.cohorts.forEach(c => {
            html += `<tr>
                <td style="font-weight:700; text-align:left; background-color:#0b1120;">${c.cohort}</td>
                <td style="color:#94a3b8; font-weight:600;">${c.size.toLocaleString()}</td>`;
            
            for (let m = 0; m <= 12; m++) {
                const rate = c.rates[m];
                if (rate !== undefined) {
                    // Calculate green-to-slate gradient
                    const opacity = Math.max(0.15, rate / 100);
                    const bg = `rgba(16, 185, 129, ${opacity.toFixed(2)})`;
                    const color = rate > 50 ? '#ffffff' : '#cbd5e1';
                    html += `<td class="cohort-cell" style="background-color:${bg}; color:${color}">${rate.toFixed(1)}%</td>`;
                } else {
                    html += `<td style="background-color:#1e293b; color:#475569;">-</td>`;
                }
            }
            html += `</tr>`;
        });
        tableBody.innerHTML = html;

        // Cohort Decay Curve
        const decayCtx = document.getElementById('cohortDecayChart')?.getContext('2d');
        if (decayCtx && !this.instances.decayCurve) {
            const months = Array.from({ length: 13 }, (_, i) => `Month ${i}`);
            // Benchmark curves for Enterprise vs Self-Serve
            const enterpriseCurve = [100, 88, 82, 78, 75, 73, 71, 70, 69, 68, 67, 66, 65];
            const blendedCurve = [100, 74, 60, 52, 47, 44, 41, 39, 37, 36, 35, 34, 33];
            const soloCurve = [100, 42, 28, 22, 19, 17, 16, 15, 14, 13, 13, 12, 12];

            this.instances.decayCurve = new Chart(decayCtx, {
                type: 'line',
                data: {
                    labels: months,
                    datasets: [
                        { label: 'Enterprise Tier (>50 Seats)', data: enterpriseCurve, borderColor: '#8B5CF6', tension: 0.3, borderWidth: 3 },
                        { label: 'Blended Product Average', data: blendedCurve, borderColor: '#10B981', tension: 0.3, borderWidth: 3 },
                        { label: 'Solo User Accounts (0 Invites)', data: soloCurve, borderColor: '#EF4444', borderDash: [5, 5], tension: 0.3, borderWidth: 2 }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { grid: { color: '#334155' }, ticks: { color: '#94A3B8' } },
                        y: { 
                            grid: { color: '#334155' }, 
                            ticks: { color: '#94A3B8', callback: v => `${v}%` },
                            min: 0,
                            max: 100
                        }
                    },
                    plugins: {
                        legend: { position: 'top', labels: { color: '#F8FAFC', boxWidth: 14 } }
                    }
                }
            });
        }
    },

    // 3. Funnel & Feature Adoption Visualizations
    renderFunnelAndAdoption() {
        const funnelContainer = document.getElementById('funnelStepsContainer');
        if (funnelContainer) {
            const maxVal = SAAS_METRICS.funnel.all[0].count;
            let html = '';
            SAAS_METRICS.funnel.all.forEach((step, idx) => {
                const widthPct = (step.count / maxVal) * 100;
                const convRate = ((step.count / maxVal) * 100).toFixed(1);
                const dropBadge = step.dropoffPct > 0 
                    ? `<span class="badge ${step.dropoffPct > 40 ? 'badge-danger' : 'badge-warning'}">-${step.dropoffPct}% Drop-off</span>` 
                    : `<span class="badge badge-primary">100% Baseline</span>`;

                html += `
                <div class="funnel-step">
                    <div class="funnel-bar-bg" style="width: ${widthPct}%"></div>
                    <div class="funnel-step-content">
                        <div>
                            <strong style="font-size:13.5px; color:#f8fafc;">${step.step}</strong>
                            <div style="font-size:12px; color:#94a3b8; margin-top:2px;">${convRate}% of Total Signups</div>
                        </div>
                        <div style="display:flex; align-items:center; gap:16px;">
                            <span style="font-size:16px; font-weight:700; color:#38bdf8;">${step.count.toLocaleString()} Users</span>
                            ${dropBadge}
                        </div>
                    </div>
                </div>`;
            });
            funnelContainer.innerHTML = html;
        }

        // Feature Adoption vs. Retention Chart
        const featCtx = document.getElementById('featureAdoptionChart')?.getContext('2d');
        if (featCtx && !this.instances.featureAdoption) {
            this.instances.featureAdoption = new Chart(featCtx, {
                type: 'bar',
                data: {
                    labels: SAAS_METRICS.featureAdoption.map(f => f.feature),
                    datasets: [{
                        label: '90-Day User Retention Rate (%)',
                        data: SAAS_METRICS.featureAdoption.map(f => f.retention90d),
                        backgroundColor: SAAS_METRICS.featureAdoption.map(f => f.retention90d >= 70 ? '#10B981' : (f.retention90d >= 40 ? '#3B82F6' : '#EF4444')),
                        borderRadius: 6
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { grid: { color: '#334155' }, ticks: { color: '#94A3B8', callback: v => `${v}%` }, max: 100 },
                        y: { grid: { display: false }, ticks: { color: '#F8FAFC', font: { size: 12 } } }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: { callbacks: { label: ctx => `90-Day Retention: ${ctx.raw}%` } }
                    }
                }
            });
        }
    },

    // 4. Render Account Health Table
    renderAccountHealthTable() {
        const tableBody = document.getElementById('accountHealthTableBody');
        if (!tableBody) return;

        let html = '';
        SAAS_METRICS.accounts.forEach(acc => {
            const riskBadge = acc.risk === 'Low Risk' 
                ? `<span class="badge badge-success">Low Risk</span>`
                : (acc.risk === 'Medium Risk' ? `<span class="badge badge-warning">Medium Risk</span>` : `<span class="badge badge-danger">High Risk</span>`);
            
            const scoreColor = acc.healthScore >= 75 ? '#10B981' : (acc.healthScore >= 50 ? '#F59E0B' : '#EF4444');

            html += `<tr>
                <td style="font-family:var(--font-mono); color:#94a3b8;">${acc.id}</td>
                <td><strong style="color:#f8fafc;">${acc.company}</strong></td>
                <td><span class="badge badge-primary">${acc.plan}</span></td>
                <td>$${acc.mrr}</td>
                <td>${acc.lastActiveDays}d ago</td>
                <td>${acc.activeDays30d} / 30d</td>
                <td>${acc.tickets} (${acc.csat}★)</td>
                <td><strong style="color:${scoreColor}; font-size:14px;">${acc.healthScore} / 100</strong></td>
                <td>${riskBadge}</td>
                <td style="font-size:12px; color:#cbd5e1;">${acc.playbook}</td>
            </tr>`;
        });
        tableBody.innerHTML = html;
    }
};
