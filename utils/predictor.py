import pandas as pd
from sklearn.linear_model import LinearRegression

class ESGPredictor:
    """
    Predicts future ESG scores using Linear Regression
    """
    
    def __init__(self, scores_df):
        self.scores = scores_df
    
    def predict_next_year(self, company_id):
        """Predict ESG score for next year"""
        # Get company's historical data
        company_scores = self.scores[self.scores['company_id'] == company_id].sort_values('year')
        
        if len(company_scores) < 3:
            return None  # Need at least 3 years of data
        
        # Prepare data
        X = company_scores[['year']].values
        
        predictions = {}
        
        # Predict each category
        for category in ['environmental', 'social', 'governance', 'overall']:
            y = company_scores[category].values
            
            # Train simple linear regression
            model = LinearRegression()
            model.fit(X, y)
            
            # Predict next year
            next_year = company_scores['year'].max() + 1
            predicted_score = model.predict([[next_year]])[0]
            
            # Cap between 0-100
            predicted_score = max(0, min(100, predicted_score))
            
            predictions[category] = round(predicted_score, 1)
        
        predictions['year'] = int(next_year)
        
        return predictions
    
    def get_trend_direction(self, company_id):
        """Check if company is improving or declining"""
        company_scores = self.scores[self.scores['company_id'] == company_id].sort_values('year')
        
        if len(company_scores) < 2:
            return 'stable'
        
        latest = company_scores.iloc[-1]['overall']
        previous = company_scores.iloc[-2]['overall']
        
        diff = latest - previous
        
        if diff > 2:
            return 'improving'
        elif diff < -2:
            return 'declining'
        else:
            return 'stable'