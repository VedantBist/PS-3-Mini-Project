# Banking Customer Segmentation Dashboard

A full-stack mini project for customer analytics and segmentation using FastAPI, React (Vite), Pandas, NumPy, and Scikit-learn KMeans.

## Features

### Backend (FastAPI)
- Upload customer CSV datasets
- Preprocessing pipeline:
  - Missing value handling
  - Duplicate removal
  - Gender encoding (`GenderEncoded`)
- Data operations:
  - Aggregates (`avg`, `sum`, `min`, `max`)
  - Quantiles/percentiles
- CRUD operations for customers
- Filtering by age, income, and spending score
- Statistical analysis (mean, median, std deviation)
- KMeans clustering (3-5 clusters)
- Export processed dataset as CSV

### Frontend (React + Tailwind + Recharts)
- Sidebar + main dashboard layout
- Dataset upload controls
- Editable customer table
- Filters for age/income/spending
- Charts:
  - Income vs Spending scatter plot
  - Cluster distribution bar chart
  - Segment share pie chart
- Add/Edit customer modal form
- Actions for clustering and CSV export
- Optional light/dark mode toggle

## Project Structure

```text
backend/
  main.py
  requirements.txt
  data/
    sample_customers.csv
  models/
    schemas.py
  routes/
    dataset.py
  services/
    data_service.py

frontend/
  package.json
  vite.config.js
  tailwind.config.js
  postcss.config.js
  index.html
  src/
    App.jsx
    main.jsx
    index.css
    services/
      api.js
    pages/
      Dashboard.jsx
    components/
      Sidebar.jsx
      UploadPanel.jsx
      FiltersBar.jsx
      StatsCards.jsx
      CustomerTable.jsx
      CustomerFormModal.jsx
      ChartsPanel.jsx
```

## Dataset Format

CSV should include these columns:
- `CustomerID`
- `Age`
- `Gender`
- `AnnualIncome`
- `SpendingScore`
- `Balance`

A sample file is available at `backend/data/sample_customers.csv`.

## Generate Datasets

The backend includes a dataset generator for creating larger, repeatable CSV files with realistic customer segments.

```bash
cd backend
python generate_dataset.py --rows 1000 --output data/generated_customers.csv --seed 42
```

To test preprocessing with missing values, duplicate rows, outliers, and noisy gender labels:

```bash
python generate_dataset.py --rows 1000 --dirty --output data/generated_customers_dirty.csv
```

Useful options:
- `--rows` - base number of customers to generate
- `--seed` - repeatable random seed
- `--dirty` - inject data quality issues for preprocessing tests
- `--missing-rate` - per-cell missing value rate for dirty datasets
- `--duplicate-rate` - duplicate row rate for dirty datasets
- `--outlier-rate` - outlier row rate for dirty datasets
- `--include-segment` - add a `Segment` column for manual inspection

## Run Instructions

Prerequisites:
- Python 3.10+
- Node.js 18+
- npm

## 1. Start Backend

### macOS/Linux

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Windows PowerShell

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

If PowerShell blocks virtual environment activation, run this in the same terminal and then activate again:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

Backend API docs: `http://localhost:8000/docs`

## 2. Start Frontend

Open a new terminal:

### macOS/Linux and Windows

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

If needed, override backend URL:

### macOS/Linux

```bash
VITE_API_BASE_URL=http://localhost:8000 npm run dev
```

### Windows PowerShell

```powershell
$env:VITE_API_BASE_URL="http://localhost:8000"
npm run dev
```

## API Endpoints (Summary)

- `POST /api/upload` - Upload CSV
- `POST /api/preprocess` - Run preprocessing
- `GET /api/customers` - List/filter customers
- `POST /api/customers` - Add customer
- `PUT /api/customers/{customer_id}` - Update customer
- `DELETE /api/customers/{customer_id}` - Delete customer
- `GET /api/operations/aggregations` - Get avg/sum/min/max
- `GET /api/operations/quantiles?column=AnnualIncome&q=0.25,0.5,0.75` - Quantiles
- `GET /api/statistics` - Mean/median/std
- `POST /api/cluster?clusters=3` - Run KMeans
- `GET /api/export` - Export processed CSV
