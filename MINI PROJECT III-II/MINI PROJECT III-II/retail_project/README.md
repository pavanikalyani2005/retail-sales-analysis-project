# Retail Project — Run Instructions

Backend (Flask):

- From project root (important so relative paths resolve):

```bash
python -m pip install -r requirements.txt
python app/app.py
```

- API endpoints:
  - `/` — health
  - `/predict` — returns next 5 predictions
  - `/anomalies` — detects anomalies from `data/data.csv`

Scheduler / Data generator:

```bash
python scheduler.py
```
Re
Frontend (Create React App):

```bash
cd frontend
npm install
npm start
```

Frontend (Vite):

```bash
cd frontend_vite
npm install
npm run dev
```

Notes:
- If the frontend calls the backend from a different host/port, CORS is enabled in the Flask app.
- Ensure `data/data.csv` exists or run `python scheduler.py` or `python data_generator.py` to create sample data.
