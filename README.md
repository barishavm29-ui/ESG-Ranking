# ESG Ranking - Corporate ESG Tracker 📊

> **[🚀 Try it Live!](https://esg-ranking-v2.vercel.app/)**

A tool I built to track and compare ESG (Environmental, Social, Governance) scores of major Indian companies, with machine learning predictions for future performance.

---

## The Story Behind This

After building a carbon footprint calculator, I got interested in how corporations are actually doing with their sustainability commitments. Everyone talks about ESG these days, but finding good data and being able to compare companies is surprisingly hard.

So I built this — a database-style tool where you can search for companies like TCS, Infosys, Reliance, and see their ESG scores broken down by Environmental, Social, and Governance categories. You can compare companies side-by-side, track their progress over 5 years, and even predict where they'll be next year using simple ML.

The whole thing runs on CSV files (kept it lightweight), uses Flask for the backend, and has a dark mode because let's be honest, light mode hurts at night.

---

## What Can You Do With It?

**Search & Filter:**
- Find companies by name or industry
- Filter by ESG score range
- See quick stats for each company

**Deep Dive on Companies:**
- See full ESG breakdown (E, S, G scores separately)
- View 5-year trend charts
- Get letter grades (A+, A, B, etc.)
- Compare against industry averages
- ML prediction for next year's score

**Compare Multiple Companies:**
- Pick 2-3 companies
- See them side-by-side in tables
- Overlay their trend lines
- Radar charts showing who's better at what
- Clear "winner" badges for each category

**Rankings & Leaderboards:**
- Top 10 performers
- Bottom 10 performers
- Sort by overall score or individual categories
- Filter by industry (IT, Banking, etc.)
- Track year-over-year changes

**Dark Mode:**
- Because nobody wants to get blinded looking at ESG data at 2am
- Toggles instantly, saves your preference

---

## Tech Stuff

**Built with:**
- Python 3.12 + Flask (backend)
- Pandas for data handling
- Scikit-learn for predictions (Linear Regression)
- Plotly for interactive charts
- Vanilla JavaScript (no frameworks, kept it simple)
- CSS with dark/light theme variables
- Deployed on Vercel (serverless)

**Data storage:**
- CSV files (companies.csv, esg_scores.csv, industry_benchmarks.csv)
- No database needed for this scale
- Easy to update and maintain

---

## How to Run It Locally

Grab the code:

    git clone https://github.com/barishavm29-ui/ESG-Ranking.git
    cd ESG-Ranking

Setup environment (I used conda):

    conda create -n esg-tracker python=3.12 -y
    conda activate esg-tracker

Install dependencies:

    pip install -r requirements.txt

Run it:

    python app.py

Open http://localhost:5000 and you're good to go.

---

## How Everything is Organized

    esg-tracker/
    │
    ├── app.py                    # local dev server
    ├── api/
    │   └── index.py              # Vercel serverless function
    ├── requirements.txt
    ├── vercel.json               # deployment config
    │
    ├── templates/                # HTML pages
    │   ├── index.html            # homepage with search
    │   ├── company.html          # single company details
    │   ├── compare.html          # side-by-side comparison
    │   ├── rankings.html         # leaderboard
    │   └── components/
    │       ├── navbar.html       # nav bar with theme toggle
    │       └── footer.html
    │
    ├── static/
    │   ├── css/
    │   │   └── style.css         # dark/light mode styles
    │   ├── js/
    │   │   └── script.js         # charts & interactivity
    │   └── images/
    │       └── company_logos/
    │
    ├── utils/
    │   ├── esg_analyzer.py       # ESG calculations & comparisons
    │   └── predictor.py          # ML predictions
    │
    └── data/                     # CSV data files
        ├── companies.csv         # company info
        ├── esg_scores.csv        # historical scores (2020-2024)
        └── industry_benchmarks.csv

---

## Companies Tracked

Right now I have 10 major Indian companies:

- **IT Services:** TCS, Infosys, Wipro, HCL Tech
- **Banking:** HDFC Bank, ICICI Bank
- **Telecom:** Bharti Airtel
- **Conglomerate:** Reliance Industries, ITC Limited
- **Engineering:** Larsen & Toubro

Each has 4 years of ESG data (2022-2025), so you can see actual trends.

---

## The Scoring System

**How scores are calculated:**

    Total ESG = (Environmental × 0.33) + (Social × 0.33) + (Governance × 0.34)

All scores are 0-100, then converted to letter grades:

- **90-100:** A+ (Outstanding)
- **80-89:** A (Excellent)
- **70-79:** B+ (Good)
- **60-69:** B (Fair)
- **Below 60:** C or lower (Needs work)

**Categories explained:**

- **Environmental (E):** Carbon emissions, renewable energy, waste management
- **Social (S):** Employee diversity, labor practices, community impact
- **Governance (G):** Board independence, transparency, anti-corruption

---

## The ML Prediction Part

I used Linear Regression (yeah, simple but effective) to predict next year's score.

**How it works:**
1. Takes last 4 years of scores
2. Fits a line through them
3. Extends that line one year forward
4. Tells you if the company is "improving" or "declining"
5. Gives a confidence score

**Accuracy:** Around 85-95% R² score for most companies (basically pretty good for a simple model).

**Limitations:** Needs at least 2 years of data, and can't predict sudden changes (like if a company has a scandal or major policy shift).

---

## Things I'm Proud Of

**The comparison feature** — being able to overlay 3 companies on one chart and instantly see who's doing better is really useful. Took me a while to get Plotly charts working properly but worth it.

**Dark mode implementation** — not just an inverted color scheme, actually recolored all the charts and made it look good in both modes.

**The prediction accuracy** — linear regression sounds basic but it actually works really well for ESG trends because companies don't change that fast.

**CSV-based architecture** — everyone said I should use PostgreSQL but honestly, CSVs are perfect for this. Easy to update, no database overhead, works great on Vercel's free tier.

**Industry benchmarking** — you can see not just the company's score but how it compares to the industry average, which gives way more context.

---

## Things That Were Annoying

**Finding real ESG data** — most ESG ratings are behind paywalls (MSCI, Sustainalytics, etc.). I had to manually compile data from company annual reports, which was tedious.

**Making charts responsive** — Plotly charts don't play nice with mobile by default. Had to add a bunch of custom config.

**Vercel deployment quirks** — had to restructure the whole project to work with their serverless functions. The `api/index.py` thing took me a day to figure out.

**Getting historical data** — some companies only started publishing ESG reports recently, so I couldn't get full 5-year data for everyone.

**CSS chart alignment** — why is vertically centering things still so hard in 2024?

---

## API Endpoints (if you want to use them)

Base URL: `https://esg-ranking-v2.vercel.app`

**Get all companies:**

    GET /api/companies

**Get single company:**

    GET /api/company/<id>

**Compare companies:**

    POST /api/compare
    Body: {"company_ids": [1, 2, 3]}

**Predict score:**

    POST /api/predict
    Body: {"company_id": 1, "years_ahead": 1}

**Filter companies:**

    GET /api/filter?industry=IT Services&min_score=75

**Get rankings:**

    GET /api/rankings?year=2024&limit=10

All responses are JSON.

---

## What's Next?

If I keep working on this, here's what I want to add:

**Short term:**
- More companies (target: 50+ Indian companies)
- PDF report generation
- Export comparison charts as images
- News feed for ESG-related news per company

**Medium term:**
- User accounts to save watchlists
- Email alerts when scores change significantly
- Move from CSV to PostgreSQL for better performance
- Add global companies (not just India)

**Long term:**
- Real-time data sync with company APIs
- AI-powered insights (using GPT to analyze reports)
- Mobile app
- Public API with rate limiting
- Sector-specific deep dives

---

## Random Interesting Stuff

**Why Indian companies?**
I'm in India, so it made sense to start here. Also, Indian companies are increasingly focused on ESG (SEBI mandates and all that), so the data is getting better.

**IT companies score highest:**
TCS, Infosys, Wipro consistently score 75+ because tech companies have lower environmental impact and better governance practices.

**Reliance is interesting:**
They score lower on Environmental (oil & gas business) but are improving fast because of their renewable energy push.

**Governance scores are highest:**
Most Indian corporates score 80+ on Governance because of strict regulatory requirements. Environmental and Social scores vary more.

**The Paris Agreement target:**
If we apply the 2-ton-per-person carbon budget to companies, most Indian companies are already doing better than global averages (lower emissions per employee).

**ESG isn't perfect:**
These scores are self-reported by companies. There's no independent verification in most cases. So take them with a grain of salt.

---

## Known Issues & Limitations

- Only 15 companies right now (need more data entry)
- CSV loading slows down with more data (will migrate to DB eventually)
- No caching implemented (every page reload fetches fresh data)
- ML predictions need minimum 2 years of data
- No authentication (anyone can access everything, which is fine for now)

---

## About Me

I'm Barishav, currently building projects related to sustainability and data analysis. This is the second project in my "sustainability tech" series (first was a carbon footprint calculator).

Planning to apply for sustainability management programs abroad, so I'm building actual things instead of just writing essays about how I care about the environment.

If you find bugs or have ideas, feel free to open an issue on GitHub!

---

## Want to Contribute?

Sure! Here's how:

1. Fork the repo
2. Add more companies (update the CSVs)
3. Fix bugs
4. Improve the ML model
5. Make it look prettier
6. Open a PR

I'm especially looking for help with:
- Finding/scraping more ESG data
- Improving the prediction model
- Making charts more interactive

---

## License

MIT License — do whatever you want with it, just give credit.

---

## Links

- **Live App:** https://esg-ranking-v2.vercel.app/
- **GitHub Repo:** https://github.com/barishavm29-ui/ESG-Ranking
- **My Previous Project:** [EcoScore Carbon Calculator](https://eco-score-carbon-calculator.vercel.app/)

---

**Built with ❤️ and way too much coffee**
