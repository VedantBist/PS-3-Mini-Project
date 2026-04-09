# Automated Student Performance & Attendance Profiler

A full-stack mini project for college labs that combines React (UI) and Python (backend) to implement key data-analysis experiments in one workflow.

## Features Mapped to Experiments

- **Preprocessing (Exp 2)**
  - Handles missing marks and `Absent`/`AB`/blank values.
  - Imputes missing subject marks using subject-wise mean.
  - Normalizes attendance (missing/absent => `0`, clamps to `0-100`).

- **Aggregates & Stats (Exp 4 & 12)**
  - Computes student `Total`, `Average`, and `GPA`.
  - Computes class-level `Class Average` and `Class GPA`.
  - Computes per-subject `Average`, `Standard Deviation`, `Min`, `Max`.

- **Quantile Analysis (Exp 5)**
  - Computes percentile rank for each student.
  - Identifies top 10% students (`Percentile >= 90`) for achievement lists.

- **String Operations (Exp 14)**
  - Formats student names to title case.
  - Standardizes emails to lowercase.
  - Auto-generates email if missing (`firstname.lastname@college.edu`).
  - Generates automated remarks based on average score ranges.

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Python + Flask
- **Data Input:** CSV upload

## Project Structure

```text
PS-Mini Project/
├── backend/
│   ├── app.py
│   ├── analyzer.py
│   ├── requirements.txt
│   └── sample_students.csv
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.css
│       ├── App.jsx
│       └── main.jsx
└── README.md
```

## Run the Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Backend runs on: `http://localhost:5000`

## Run the Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

If backend is running on a different port (for example `5050`), run:

```bash
VITE_API_BASE_URL=http://localhost:5050 npm run dev
```

## CSV Format

Minimum required:

- `Name`
- One or more subject columns (e.g., `Math`, `Physics`)

Optional:

- `Email`
- `Attendance`

Example:

```csv
Name,Email,Attendance,Math,Physics,Chemistry,English
Rahul Sharma,rahul@college.edu,92,88,91,Absent,79
Ananya Singh,,97,95,89,93,90
```

A ready sample file is available at:

- `backend/sample_students.csv`

## API Endpoints

- `GET /health` -> service status
- `POST /analyze` -> analyze uploaded CSV file (`multipart/form-data`, field name: `file`)

## UI Highlights

- Upload CSV and process instantly.
- Summary cards for class-level KPIs.
- Subject statistics table with standard deviation.
- Top-10%-students panel by percentile.
- Detailed student table with GPA, percentile, attendance, and auto remarks.

## Notes

- This backend uses pure Python CSV/statistics logic to keep setup lightweight and reliable.
- You can directly demo with `backend/sample_students.csv`.
