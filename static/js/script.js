// ========== THEME TOGGLE ==========

const currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);

const themeIcon = document.getElementById('themeIcon');
if (themeIcon) {
    themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    const icon = document.getElementById('themeIcon');
    icon.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        icon.style.transform = 'rotate(0deg)';
    }, 300);
}

// ========== SEARCH FUNCTIONALITY ==========

let searchTimeout = null;

function searchCompanies(query) {
    const resultsDiv = document.getElementById('searchResults');

    if (!query || query.length < 1) {
        resultsDiv.style.display = 'none';
        return;
    }

    // Debounce search
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
        try {
            const response = await fetch(`/api/companies?q=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (data.success && data.companies.length > 0) {
                resultsDiv.innerHTML = data.companies.map(company => `
                    <a href="/company/${company.id}" class="search-result-item">
                        <div>
                            <div class="search-result-name">${company.name}</div>
                            <div class="search-result-industry">${company.industry}</div>
                        </div>
                        <span class="search-result-score" style="background: ${company.score_color}">
                            ${company.latest_score}
                        </span>
                    </a>
                `).join('');
                resultsDiv.style.display = 'block';
            } else {
                resultsDiv.innerHTML = '<div class="search-result-item">No companies found</div>';
                resultsDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    }, 300);
}

// Close search results when clicking outside
document.addEventListener('click', (e) => {
    const resultsDiv = document.getElementById('searchResults');
    const searchInput = document.getElementById('searchInput');
    if (resultsDiv && !resultsDiv.contains(e.target) && e.target !== searchInput) {
        resultsDiv.style.display = 'none';
    }
});

// ========== HOMEPAGE - LOAD COMPANY CARDS ==========

async function loadCompanyCards() {
    try {
        const response = await fetch('/api/companies');
        const data = await response.json();

        if (data.success) {
            const container = document.getElementById('companyCards');
            container.innerHTML = data.companies.map(company => `
                <a href="/company/${company.id}" class="company-card" style="border-left-color: ${company.score_color}">
                    <div class="company-card-header">
                        <div>
                            <div class="company-card-name">${company.name}</div>
                            <div class="company-card-industry">${company.industry}</div>
                        </div>
                        <div>
                            <div class="company-card-score" style="background: ${company.score_color}">
                                ${company.latest_score}
                            </div>
                            <div class="company-card-rating">${company.rating}</div>
                        </div>
                    </div>
                    <div class="company-card-trend">
                        <i class="fas fa-arrow-${company.trend === 'improving' ? 'up' : 'right'}"></i>
                        ${company.trend === 'improving' ? 'Improving' : 'Stable'}
                    </div>
                </a>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading companies:', error);
    }
}

// ========== HOMEPAGE - LOAD INDUSTRY CARDS ==========

async function loadIndustryCards() {
    try {
        const response = await fetch('/api/industries');
        const data = await response.json();

        if (data.success) {
            const container = document.getElementById('industryCards');
            container.innerHTML = data.industries.map(industry => {
                const score = industry.scores.overall;
                const color = score >= 80 ? '#10b981' : score >= 70 ? '#3b82f6' : score >= 60 ? '#f59e0b' : '#ef4444';
                return `
                    <div class="industry-card">
                        <h4>${industry.name}</h4>
                        <div class="score-bar">
                            <div class="score-fill" style="width: ${score}%; background: ${color}"></div>
                        </div>
                        <div class="score-text">
                            Average ESG Score: <strong>${score}/100</strong> 
                            (${industry.company_count} companies)
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading industries:', error);
    }
}

// ========== COMPANY DETAIL PAGE ==========

async function loadCompanyDetails(companyId) {
    try {
        const response = await fetch(`/api/company/${companyId}`);
        const data = await response.json();

        if (data.success) {
            renderCompanyHeader(data);
            renderScoreCards(data);
            renderRadarChart(data);
            renderTrendChart(data);
            renderPrediction(data);
            renderStrengthsWeaknesses(data);
            renderIndustryComparison(data);
            renderHistoryTable(data);
        }
    } catch (error) {
        console.error('Error loading company:', error);
    }
}

function renderCompanyHeader(data) {
    const container = document.getElementById('companyHeader');
    const company = data.company;
    const latest = data.latest_score;

    container.innerHTML = `
        <div class="company-title">${company.name}</div>
        <div class="company-meta">
            <span><i class="fas fa-industry"></i> ${company.industry}</span>
            <span><i class="fas fa-map-marker-alt"></i> ${company.headquarters}</span>
            <span><i class="fas fa-users"></i> ${company.employees.toLocaleString()} employees</span>
            <span><i class="fas fa-calendar"></i> Founded ${company.founded}</span>
        </div>
        <div class="company-overall-score">${latest.overall}/100</div>
        <div class="company-rating-badge">Rating: ${latest.rating}</div>
    `;
}

function renderScoreCards(data) {
    const container = document.getElementById('scoreCards');
    const latest = data.latest_score;

    const categories = [
        { label: '🌍 Environmental', value: latest.environmental, color: '#10b981' },
        { label: '👥 Social', value: latest.social, color: '#3b82f6' },
        { label: '⚖️ Governance', value: latest.governance, color: '#6366f1' },
        { label: '📊 Overall', value: latest.overall, color: '#f59e0b' }
    ];

    container.innerHTML = categories.map(cat => `
        <div class="score-card" style="border-top-color: ${cat.color}">
            <div class="score-card-label">${cat.label}</div>
            <div class="score-card-value" style="color: ${cat.color}">${cat.value}</div>
            <div class="score-card-bar">
                <div class="score-card-fill" style="width: ${cat.value}%; background: ${cat.color}"></div>
            </div>
        </div>
    `).join('');
}

function renderRadarChart(data) {
    const latest = data.latest_score;

    const chartData = [{
        type: 'scatterpolar',
        r: [latest.environmental, latest.social, latest.governance, latest.environmental],
        theta: ['Environmental', 'Social', 'Governance', 'Environmental'],
        fill: 'toself',
        fillcolor: 'rgba(99, 102, 241, 0.2)',
        line: { color: '#6366f1', width: 3 },
        marker: { size: 8, color: '#6366f1' }
    }];

    // Add industry average if available
    if (data.industry_average) {
        const avg = data.industry_average;
        chartData.push({
            type: 'scatterpolar',
            r: [avg.environmental, avg.social, avg.governance, avg.environmental],
            theta: ['Environmental', 'Social', 'Governance', 'Environmental'],
            fill: 'toself',
            fillcolor: 'rgba(148, 163, 184, 0.1)',
            line: { color: '#94a3b8', width: 2, dash: 'dash' },
            name: 'Industry Avg',
            marker: { size: 6, color: '#94a3b8' }
        });
    }

    const layout = {
        polar: {
            radialaxis: {
                visible: true,
                range: [0, 100],
                tickfont: { size: 10 }
            }
        },
        showlegend: false,
        margin: { t: 30, b: 30, l: 60, r: 60 },
        height: 350,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
    };

    Plotly.newPlot('radarChart', chartData, layout, { responsive: true, displayModeBar: false });
}

function renderTrendChart(data) {
    const trend = data.trend;

    const traces = [
        {
            x: trend.map(t => t.year),
            y: trend.map(t => t.overall),
            name: 'Overall',
            type: 'scatter',
            mode: 'lines+markers',
            line: { color: '#f59e0b', width: 3 },
            marker: { size: 8 }
        },
        {
            x: trend.map(t => t.year),
            y: trend.map(t => t.environmental),
            name: 'Environmental',
            type: 'scatter',
            mode: 'lines+markers',
            line: { color: '#10b981', width: 2 },
            marker: { size: 6 }
        },
        {
            x: trend.map(t => t.year),
            y: trend.map(t => t.social),
            name: 'Social',
            type: 'scatter',
            mode: 'lines+markers',
            line: { color: '#3b82f6', width: 2 },
            marker: { size: 6 }
        },
        {
            x: trend.map(t => t.year),
            y: trend.map(t => t.governance),
            name: 'Governance',
            type: 'scatter',
            mode: 'lines+markers',
            line: { color: '#6366f1', width: 2 },
            marker: { size: 6 }
        }
    ];

    const layout = {
        xaxis: { title: '', tickmode: 'linear' },
        yaxis: { title: 'Score', range: [30, 100] },
        margin: { t: 20, b: 40, l: 50, r: 20 },
        height: 350,
        legend: { orientation: 'h', y: -0.15 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
    };

    Plotly.newPlot('trendChart', traces, layout, { responsive: true, displayModeBar: false });
}

function renderPrediction(data) {
    const container = document.getElementById('predictionCard');
    const prediction = data.prediction;
    const latest = data.latest_score;

    if (!prediction) {
        container.style.display = 'none';
        return;
    }

    const change = prediction.overall - latest.overall;
    const arrow = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';

    container.innerHTML = `
        <div>
            <div class="prediction-label">🤖 ML Predicted Score for ${prediction.year}</div>
            <div class="prediction-change">${arrow} ${change > 0 ? '+' : ''}${change.toFixed(1)} points from current</div>
        </div>
        <div>
            <div class="prediction-value">${prediction.overall}/100</div>
        </div>
        <div>
            <div class="prediction-label">Predicted Breakdown</div>
            <div>E: ${prediction.environmental} | S: ${prediction.social} | G: ${prediction.governance}</div>
        </div>
    `;
}

function renderStrengthsWeaknesses(data) {
    const sw = data.strengths_weaknesses;

    document.getElementById('strengthsCard').innerHTML = `
        <h3>💪 Strengths</h3>
        ${sw.strengths.map(s => `<div class="analysis-item"><i class="fas fa-check-circle" style="color: #10b981"></i> ${s}</div>`).join('')}
    `;

    document.getElementById('weaknessesCard').innerHTML = `
        <h3>⚠️ Areas for Improvement</h3>
        ${sw.weaknesses.map(w => `<div class="analysis-item"><i class="fas fa-exclamation-circle" style="color: #f59e0b"></i> ${w}</div>`).join('')}
    `;
}

function renderIndustryComparison(data) {
    const latest = data.latest_score;
    const avg = data.industry_average;
    const company = data.company;

    if (!avg) return;

    const chartData = [
        {
            x: ['Environmental', 'Social', 'Governance', 'Overall'],
            y: [latest.environmental, latest.social, latest.governance, latest.overall],
            name: company.name,
            type: 'bar',
            marker: { color: '#6366f1' }
        },
        {
            x: ['Environmental', 'Social', 'Governance', 'Overall'],
            y: [avg.environmental, avg.social, avg.governance, avg.overall],
            name: `${company.industry} Average`,
            type: 'bar',
            marker: { color: '#94a3b8' }
        }
    ];

    const layout = {
        barmode: 'group',
        xaxis: { title: '' },
        yaxis: { title: 'Score', range: [0, 100] },
        margin: { t: 20, b: 40, l: 50, r: 20 },
        height: 350,
        legend: { orientation: 'h', y: -0.2 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
    };

    Plotly.newPlot('industryCompChart', chartData, layout, { responsive: true, displayModeBar: false });
}

function renderHistoryTable(data) {
    const tbody = document.querySelector('#historyTable tbody');
    const scores = data.all_scores;

    tbody.innerHTML = scores.sort((a, b) => b.year - a.year).map(score => `
        <tr>
            <td><strong>${score.year}</strong></td>
            <td style="color: ${getScoreColor(score.environmental)}">${score.environmental}</td>
            <td style="color: ${getScoreColor(score.social)}">${score.social}</td>
            <td style="color: ${getScoreColor(score.governance)}">${score.governance}</td>
            <td><strong style="color: ${getScoreColor(score.overall)}">${score.overall}</strong></td>
            <td><span style="background: ${getScoreColor(score.overall)}; color: white; padding: 0.25rem 0.75rem; border-radius: 999px; font-weight: 700;">${score.rating}</span></td>
        </tr>
    `).join('');
}

// ========== COMPARE PAGE ==========

async function loadCompanyDropdowns() {
    try {
        const response = await fetch('/api/companies');
        const data = await response.json();

        if (data.success) {
            const options = data.companies.map(c =>
                `<option value="${c.id}">${c.name}</option>`
            ).join('');

            const defaultOption = '<option value="">Select company...</option>';

            document.getElementById('company1').innerHTML = defaultOption + options;
            document.getElementById('company2').innerHTML = defaultOption + options;
            document.getElementById('company3').innerHTML = defaultOption + options;
        }
    } catch (error) {
        console.error('Error loading dropdowns:', error);
    }
}

function checkSelection() {
    const c1 = document.getElementById('company1').value;
    const c2 = document.getElementById('company2').value;
    const btn = document.getElementById('compareBtn');

    btn.disabled = !(c1 && c2);
}

async function compareCompanies() {
    const ids = [
        document.getElementById('company1').value,
        document.getElementById('company2').value,
        document.getElementById('company3').value
    ].filter(id => id).map(Number);

    try {
        const response = await fetch('/api/compare', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ company_ids: ids })
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('comparisonResults').style.display = 'block';
            renderComparisonTable(data.comparison);
            renderComparisonChart(data.comparison);
            renderTrendComparison(data.comparison);
            renderWinner(data.comparison);

            document.getElementById('comparisonResults').scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Compare error:', error);
    }
}

function renderComparisonTable(comparison) {
    const head = document.getElementById('compTableHead');
    const body = document.getElementById('compTableBody');

    head.innerHTML = '<th>Category</th>' +
        comparison.map(c => `<th>${c.company.name}</th>`).join('');

    const categories = ['environmental', 'social', 'governance', 'overall'];
    const labels = {
        environmental: '🌍 Environmental',
        social: '👥 Social',
        governance: '⚖️ Governance',
        overall: '📊 Overall'
    };

    body.innerHTML = categories.map(cat => {
        const values = comparison.map(c => c.scores[cat]);
        const maxVal = Math.max(...values);

        return `<tr>
            <td><strong>${labels[cat]}</strong></td>
            ${comparison.map(c => {
                const val = c.scores[cat];
                const isMax = val === maxVal;
                return `<td style="color: ${getScoreColor(val)}; font-weight: ${isMax ? '800' : '500'}">
                    ${val} ${isMax ? '🏆' : ''}
                </td>`;
            }).join('')}
        </tr>`;
    }).join('');
}

function renderComparisonChart(comparison) {
    const traces = comparison.map((c, i) => ({
        x: ['Environmental', 'Social', 'Governance', 'Overall'],
        y: [c.scores.environmental, c.scores.social, c.scores.governance, c.scores.overall],
        name: c.company.name,
        type: 'bar',
        marker: { color: ['#6366f1', '#10b981', '#f59e0b'][i] }
    }));

    const layout = {
        barmode: 'group',
        xaxis: { title: '' },
        yaxis: { title: 'Score', range: [0, 100] },
        margin: { t: 20, b: 60, l: 50, r: 20 },
        height: 400,
        legend: { orientation: 'h', y: -0.2 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
    };

    Plotly.newPlot('comparisonChart', traces, layout, { responsive: true, displayModeBar: false });
}

function renderTrendComparison(comparison) {
    const colors = ['#6366f1', '#10b981', '#f59e0b'];

    const traces = comparison.map((c, i) => ({
        x: c.trend_data.map(t => t.year),
        y: c.trend_data.map(t => t.overall),
        name: c.company.name,
        type: 'scatter',
        mode: 'lines+markers',
        line: { color: colors[i], width: 3 },
        marker: { size: 8 }
    }));

    const layout = {
        xaxis: { title: 'Year', tickmode: 'linear' },
        yaxis: { title: 'Overall ESG Score', range: [30, 100] },
        margin: { t: 20, b: 60, l: 50, r: 20 },
        height: 400,
        legend: { orientation: 'h', y: -0.2 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
    };

    Plotly.newPlot('trendCompChart', traces, layout, { responsive: true, displayModeBar: false });
}

function renderWinner(comparison) {
    const container = document.getElementById('winnerCard');
    const winner = comparison.reduce((a, b) => a.scores.overall > b.scores.overall ? a : b);

    container.innerHTML = `
        <h3>🏆 ESG Leader</h3>
        <div class="winner-name">${winner.company.name}</div>
        <p>Overall ESG Score: ${winner.scores.overall}/100 (${winner.scores.rating})</p>
    `;
}

// ========== RANKINGS PAGE ==========

async function loadRankings(year) {
    try {
        const response = await fetch(`/api/rankings?year=${year}`);
        const data = await response.json();

        if (data.success) {
            renderRankingsTable(data.rankings);
            renderRankingsChart(data.rankings);
        }
    } catch (error) {
        console.error('Rankings error:', error);
    }
}

function renderRankingsTable(rankings) {
    const tbody = document.getElementById('rankingsBody');

    tbody.innerHTML = rankings.map(company => `
        <tr style="cursor: pointer;" onclick="window.location.href='/company/${company.rank}'">
            <td><strong>#${company.rank}</strong></td>
            <td><strong>${company.name}</strong></td>
            <td>${company.industry}</td>
            <td style="color: ${getScoreColor(company.environmental)}">${company.environmental}</td>
            <td style="color: ${getScoreColor(company.social)}">${company.social}</td>
            <td style="color: ${getScoreColor(company.governance)}">${company.governance}</td>
            <td><strong style="color: ${company.score_color}">${company.overall}</strong></td>
            <td>
                <span style="background: ${company.score_color}; color: white; padding: 0.25rem 0.75rem; border-radius: 999px; font-weight: 700;">
                    ${company.rating}
                </span>
            </td>
        </tr>
    `).join('');
}

function renderRankingsChart(rankings) {
    const data = [{
        x: rankings.map(r => r.name),
        y: rankings.map(r => r.overall),
        type: 'bar',
        marker: {
            color: rankings.map(r => r.score_color)
        },
        text: rankings.map(r => `${r.overall} (${r.rating})`),
        textposition: 'outside',
        hovertemplate: '<b>%{x}</b><br>ESG Score: %{y}/100<extra></extra>'
    }];

    const layout = {
        xaxis: {
            title: '',
            tickangle: -45,
            tickfont: { size: 11 }
        },
        yaxis: {
            title: 'ESG Score',
            range: [0, 100]
        },
        margin: { t: 30, b: 120, l: 50, r: 20 },
        height: 450,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
    };

    Plotly.newPlot('rankingsChart', data, layout, { responsive: true, displayModeBar: false });
}

// ========== HELPER FUNCTIONS ==========

function getScoreColor(score) {
    if (score >= 80) return '#10b981';
    if (score >= 70) return '#3b82f6';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
}

// ========== CONSOLE LOG ==========

console.log('%c📊 ESG Tracker Loaded!', 'color: #6366f1; font-size: 18px; font-weight: bold;');