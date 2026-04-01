from flask import Flask, render_template, request, jsonify
from utils.esg_analyzer import ESGAnalyzer
from utils.predictor import ESGPredictor

# Initialize Flask app
app = Flask(__name__)

# Initialize analyzer
analyzer = ESGAnalyzer()
predictor = ESGPredictor(analyzer.scores)


# ========== PAGE ROUTES ==========

@app.route('/')
def index():
    """Homepage with search and overview"""
    return render_template('index.html')


@app.route('/company/<int:company_id>')
def company_detail(company_id):
    """Single company detail page"""
    return render_template('company.html', company_id=company_id)


@app.route('/compare')
def compare_page():
    """Compare companies page"""
    return render_template('compare.html')


@app.route('/rankings')
def rankings_page():
    """Rankings and leaderboard page"""
    return render_template('rankings.html')


# ========== API ROUTES ==========

@app.route('/api/companies')
def api_get_companies():
    """Get all companies or search"""
    query = request.args.get('q', '')
    
    if query:
        companies = analyzer.search_companies(query)
    else:
        companies = analyzer.get_all_companies()
    
    # Add latest ESG score to each company
    for company in companies:
        latest = analyzer.get_latest_score(company['id'])
        if latest:
            company['latest_score'] = latest['overall']
            company['rating'] = latest['rating']
            company['score_color'] = analyzer.get_score_color(latest['overall'])
        
        # Add trend direction
        company['trend'] = predictor.get_trend_direction(company['id'])
    
    return jsonify({'success': True, 'companies': companies})


@app.route('/api/company/<int:company_id>')
def api_get_company(company_id):
    """Get detailed company info with ESG scores"""
    company = analyzer.get_company_by_id(company_id)
    
    if not company:
        return jsonify({'success': False, 'error': 'Company not found'}), 404
    
    # Get all data
    latest_score = analyzer.get_latest_score(company_id)
    all_scores = analyzer.get_company_scores(company_id)
    trend = analyzer.get_score_trend(company_id)
    strengths_weaknesses = analyzer.get_strengths_weaknesses(company_id)
    prediction = predictor.predict_next_year(company_id)
    trend_direction = predictor.get_trend_direction(company_id)
    
    # Get industry average for comparison
    industry_avg = analyzer.get_industry_average(company['industry'])
    
    return jsonify({
        'success': True,
        'company': company,
        'latest_score': latest_score,
        'all_scores': all_scores,
        'trend': trend,
        'strengths_weaknesses': strengths_weaknesses,
        'prediction': prediction,
        'trend_direction': trend_direction,
        'industry_average': industry_avg
    })


@app.route('/api/compare', methods=['POST'])
def api_compare():
    """Compare multiple companies"""
    data = request.get_json()
    company_ids = data.get('company_ids', [])
    
    if len(company_ids) < 2:
        return jsonify({'success': False, 'error': 'Select at least 2 companies'}), 400
    
    if len(company_ids) > 3:
        return jsonify({'success': False, 'error': 'Maximum 3 companies'}), 400
    
    results = analyzer.compare_companies(company_ids)
    
    # Add predictions for each company
    for result in results:
        company_id = result['company']['id']
        result['prediction'] = predictor.predict_next_year(company_id)
        result['trend_direction'] = predictor.get_trend_direction(company_id)
        result['trend_data'] = analyzer.get_score_trend(company_id)
    
    return jsonify({'success': True, 'comparison': results})


@app.route('/api/rankings')
def api_rankings():
    """Get company rankings"""
    year = request.args.get('year', None)
    
    if year:
        year = int(year)
    
    rankings = analyzer.get_rankings(year=year)
    
    # Add rank number and colors
    for i, company in enumerate(rankings):
        company['rank'] = i + 1
        company['score_color'] = analyzer.get_score_color(company['overall'])
    
    return jsonify({'success': True, 'rankings': rankings})


@app.route('/api/industries')
def api_industries():
    """Get list of industries with average scores"""
    industries = analyzer.companies['industry'].unique().tolist()
    
    result = []
    for industry in industries:
        avg = analyzer.get_industry_average(industry)
        if avg:
            result.append({
                'name': industry,
                'scores': avg,
                'company_count': len(analyzer.companies[analyzer.companies['industry'] == industry])
            })
    
    # Sort by overall score
    result.sort(key=lambda x: x['scores']['overall'], reverse=True)
    
    return jsonify({'success': True, 'industries': result})


# ========== RUN APP ==========

if __name__ == '__main__':
    print("📊 ESG Tracker Starting...")
    print("🏢 Tracking 15 Indian Companies")
    print("🚀 Open browser: http://localhost:5000")
    print("-" * 50)
    app.run(debug=True, port=5000)