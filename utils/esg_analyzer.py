import pandas as pd
import os

class ESGAnalyzer:
    """
    ESG Score Analyzer
    Handles all ESG calculations, comparisons, and analytics
    """
    
    def __init__(self):
        # Load data from CSV files
        companies_path = os.path.join('data', 'companies.csv')
        scores_path = os.path.join('data', 'esg_scores.csv')
        
        self.companies = pd.read_csv(companies_path)
        self.scores = pd.read_csv(scores_path)
    
    def get_all_companies(self):
        """Get list of all companies"""
        return self.companies.to_dict('records')
    
    def search_companies(self, query):
        """Search companies by name"""
        if not query:
            return self.companies.to_dict('records')
        
        filtered = self.companies[
            self.companies['name'].str.contains(query, case=False, na=False)
        ]
        return filtered.to_dict('records')
    
    def get_company_by_id(self, company_id):
        """Get single company details"""
        company = self.companies[self.companies['id'] == company_id]
        if company.empty:
            return None
        return company.iloc[0].to_dict()
    
    def get_company_scores(self, company_id, year=None):
        """Get ESG scores for a company"""
        company_scores = self.scores[self.scores['company_id'] == company_id]
        
        if year:
            company_scores = company_scores[company_scores['year'] == year]
        
        return company_scores.to_dict('records')
    
    def get_latest_score(self, company_id):
        """Get most recent ESG score"""
        company_scores = self.scores[self.scores['company_id'] == company_id]
        if company_scores.empty:
            return None
        
        latest = company_scores[company_scores['year'] == company_scores['year'].max()]
        return latest.iloc[0].to_dict()
    
    def get_score_trend(self, company_id):
        """Get historical trend for a company"""
        company_scores = self.scores[self.scores['company_id'] == company_id]
        company_scores = company_scores.sort_values('year')
        return company_scores[['year', 'environmental', 'social', 'governance', 'overall']].to_dict('records')
    
    def compare_companies(self, company_ids):
        """Compare multiple companies (latest scores)"""
        results = []
        
        for company_id in company_ids:
            company = self.get_company_by_id(company_id)
            latest_score = self.get_latest_score(company_id)
            
            if company and latest_score:
                results.append({
                    'company': company,
                    'scores': latest_score
                })
        
        return results
    
    def get_industry_average(self, industry):
        """Calculate average ESG score for an industry"""
        # Get companies in this industry
        industry_companies = self.companies[self.companies['industry'] == industry]['id'].tolist()
        
        # Get their latest scores
        latest_year = self.scores['year'].max()
        industry_scores = self.scores[
            (self.scores['company_id'].isin(industry_companies)) & 
            (self.scores['year'] == latest_year)
        ]
        
        if industry_scores.empty:
            return None
        
        return {
            'environmental': round(industry_scores['environmental'].mean(), 1),
            'social': round(industry_scores['social'].mean(), 1),
            'governance': round(industry_scores['governance'].mean(), 1),
            'overall': round(industry_scores['overall'].mean(), 1)
        }
    
    def get_rankings(self, year=None, limit=15):
        """Get top companies by ESG score"""
        if not year:
            year = self.scores['year'].max()
        
        year_scores = self.scores[self.scores['year'] == year]
        year_scores = year_scores.sort_values('overall', ascending=False).head(limit)
        
        # Merge with company details
        rankings = year_scores.merge(self.companies, left_on='company_id', right_on='id')
        
        return rankings[['name', 'industry', 'environmental', 'social', 'governance', 'overall', 'rating']].to_dict('records')
    
    def get_strengths_weaknesses(self, company_id):
        """Analyze company's ESG strengths and weaknesses"""
        latest = self.get_latest_score(company_id)
        company = self.get_company_by_id(company_id)
        
        if not latest or not company:
            return None
        
        e_score = latest['environmental']
        s_score = latest['social']
        g_score = latest['governance']
        
        scores = {
            'Environmental': e_score,
            'Social': s_score,
            'Governance': g_score
        }
        
        # Find highest and lowest
        strengths = []
        weaknesses = []
        
        for category, score in scores.items():
            if score >= 80:
                strengths.append(f"{category} ({score}/100)")
            elif score < 70:
                weaknesses.append(f"{category} ({score}/100)")
        
        # Industry comparison
        industry_avg = self.get_industry_average(company['industry'])
        
        return {
            'strengths': strengths if strengths else ['Consistent across all pillars'],
            'weaknesses': weaknesses if weaknesses else ['No major weak areas'],
            'industry_comparison': industry_avg
        }
    
    def get_score_color(self, score):
        """Return color based on score"""
        if score >= 80:
            return '#10b981'  # Green
        elif score >= 70:
            return '#3b82f6'  # Blue
        elif score >= 60:
            return '#f59e0b'  # Orange
        else:
            return '#ef4444'  # Red