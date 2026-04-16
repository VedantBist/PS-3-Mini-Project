import io
import threading
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

from models.schemas import CustomerCreate, CustomerUpdate


class DataService:
    """Central service that manages uploaded and processed customer data."""

    REQUIRED_COLUMNS = [
        "CustomerID",
        "Age",
        "Gender",
        "AnnualIncome",
        "SpendingScore",
        "Balance",
    ]

    def __init__(self) -> None:
        self._lock = threading.RLock()
        self.raw_df: Optional[pd.DataFrame] = None
        self.processed_df: Optional[pd.DataFrame] = None

    def load_csv(self, content: bytes) -> Dict[str, Any]:
        with self._lock:
            df = pd.read_csv(io.BytesIO(content))
            missing_cols = [col for col in self.REQUIRED_COLUMNS if col not in df.columns]
            if missing_cols:
                raise ValueError(f"Missing required columns: {', '.join(missing_cols)}")

            # Ensure core columns are always present and correctly typed.
            df["CustomerID"] = df["CustomerID"].astype(str)
            for col in ["Age", "AnnualIncome", "SpendingScore", "Balance"]:
                df[col] = pd.to_numeric(df[col], errors="coerce")

            self.raw_df = df.copy()
            self.processed_df = df.copy()

            return {
                "rows": int(df.shape[0]),
                "columns": list(df.columns),
                "message": "Dataset uploaded successfully.",
            }

    def preprocess(self) -> Dict[str, Any]:
        with self._lock:
            df = self._ensure_loaded().copy()

            before_rows = df.shape[0]

            # Fill missing numeric values with median for robust central tendency.
            numeric_cols = ["Age", "AnnualIncome", "SpendingScore", "Balance"]
            for col in numeric_cols:
                median_val = df[col].median()
                df[col] = df[col].fillna(median_val)

            # Fill missing gender values with mode (or Unknown if not available).
            if df["Gender"].dropna().empty:
                df["Gender"] = df["Gender"].fillna("Unknown")
            else:
                df["Gender"] = df["Gender"].fillna(df["Gender"].mode()[0])

            df["Gender"] = df["Gender"].apply(self._normalize_gender)
            df["GenderEncoded"] = df["Gender"].apply(self._encode_gender)

            df = df.drop_duplicates().reset_index(drop=True)
            removed_duplicates = before_rows - df.shape[0]

            self.processed_df = df

            return {
                "rows_after_preprocessing": int(df.shape[0]),
                "duplicates_removed": int(removed_duplicates),
                "message": "Preprocessing complete.",
            }

    def get_customers(
        self,
        age_min: Optional[float] = None,
        age_max: Optional[float] = None,
        income_min: Optional[float] = None,
        income_max: Optional[float] = None,
        spending_min: Optional[float] = None,
        spending_max: Optional[float] = None,
    ) -> Dict[str, Any]:
        with self._lock:
            df = self._ensure_loaded().copy()

            if age_min is not None:
                df = df[df["Age"] >= age_min]
            if age_max is not None:
                df = df[df["Age"] <= age_max]
            if income_min is not None:
                df = df[df["AnnualIncome"] >= income_min]
            if income_max is not None:
                df = df[df["AnnualIncome"] <= income_max]
            if spending_min is not None:
                df = df[df["SpendingScore"] >= spending_min]
            if spending_max is not None:
                df = df[df["SpendingScore"] <= spending_max]

            records = self._to_records(df)
            return {"total": len(records), "data": records}

    def add_customer(self, payload: CustomerCreate) -> Dict[str, Any]:
        with self._lock:
            df = self._ensure_loaded().copy()
            customer_id = str(payload.CustomerID)

            if customer_id in df["CustomerID"].astype(str).values:
                raise ValueError("CustomerID already exists.")

            new_row = payload.model_dump()
            new_row["CustomerID"] = customer_id
            new_row["Gender"] = self._normalize_gender(new_row["Gender"])
            new_row["GenderEncoded"] = self._encode_gender(new_row["Gender"])

            if "Cluster" in df.columns:
                new_row["Cluster"] = np.nan

            df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
            self.processed_df = df
            return new_row

    def update_customer(self, customer_id: str, payload: CustomerUpdate) -> Dict[str, Any]:
        with self._lock:
            df = self._ensure_loaded().copy()
            customer_id = str(customer_id)

            mask = df["CustomerID"].astype(str) == customer_id
            if not mask.any():
                raise KeyError("Customer not found.")

            updates = payload.model_dump(exclude_none=True)
            if "Gender" in updates:
                updates["Gender"] = self._normalize_gender(updates["Gender"])
                updates["GenderEncoded"] = self._encode_gender(updates["Gender"])

            for key, value in updates.items():
                df.loc[mask, key] = value

            self.processed_df = df
            row = df.loc[mask].iloc[0].to_dict()
            return self._serialize_row(row)

    def delete_customer(self, customer_id: str) -> Dict[str, Any]:
        with self._lock:
            df = self._ensure_loaded().copy()
            customer_id = str(customer_id)

            mask = df["CustomerID"].astype(str) == customer_id
            if not mask.any():
                raise KeyError("Customer not found.")

            self.processed_df = df.loc[~mask].reset_index(drop=True)
            return {"message": f"Customer {customer_id} deleted successfully."}

    def get_aggregations(self) -> Dict[str, Dict[str, float]]:
        with self._lock:
            df = self._ensure_loaded().copy()
            numeric_df = df.select_dtypes(include=np.number)
            summary: Dict[str, Dict[str, float]] = {}

            for col in numeric_df.columns:
                summary[col] = {
                    "avg": float(numeric_df[col].mean()),
                    "sum": float(numeric_df[col].sum()),
                    "min": float(numeric_df[col].min()),
                    "max": float(numeric_df[col].max()),
                }

            return summary

    def get_quantiles(self, column: str, quantiles: List[float]) -> Dict[str, Any]:
        with self._lock:
            df = self._ensure_loaded().copy()
            if column not in df.columns:
                raise ValueError("Column not found.")

            series = pd.to_numeric(df[column], errors="coerce")
            if series.isna().all():
                raise ValueError("Selected column is not numeric.")

            result = series.quantile(quantiles).to_dict()
            formatted = {str(q): float(v) for q, v in result.items()}
            return {"column": column, "quantiles": formatted}

    def get_statistics(self) -> Dict[str, Dict[str, float]]:
        with self._lock:
            df = self._ensure_loaded().copy()
            numeric_df = df.select_dtypes(include=np.number)
            return {
                "mean": {col: float(numeric_df[col].mean()) for col in numeric_df.columns},
                "median": {col: float(numeric_df[col].median()) for col in numeric_df.columns},
                "std": {
                    col: float(numeric_df[col].std(ddof=0))
                    for col in numeric_df.columns
                },
            }

    def run_clustering(self, clusters: int) -> Dict[str, Any]:
        with self._lock:
            if clusters < 3 or clusters > 5:
                raise ValueError("Clusters must be between 3 and 5.")

            df = self._ensure_loaded().copy()
            feature_cols = ["Age", "AnnualIncome", "SpendingScore", "Balance"]

            features = df[feature_cols].copy()
            features = features.fillna(features.median(numeric_only=True))

            scaler = StandardScaler()
            scaled_features = scaler.fit_transform(features)

            model = KMeans(n_clusters=clusters, random_state=42, n_init=10)
            labels = model.fit_predict(scaled_features)

            df["Cluster"] = labels
            self.processed_df = df

            centroids = scaler.inverse_transform(model.cluster_centers_).tolist()

            return {
                "clusters": clusters,
                "labels": [int(label) for label in labels.tolist()],
                "centroids": centroids,
            }

    def export_csv(self) -> bytes:
        with self._lock:
            df = self._ensure_loaded().copy()
            return df.to_csv(index=False).encode("utf-8")

    def _ensure_loaded(self) -> pd.DataFrame:
        if self.processed_df is None:
            raise ValueError("No dataset loaded. Please upload a CSV first.")
        return self.processed_df

    def _normalize_gender(self, value: Any) -> str:
        value_str = str(value).strip().lower()
        if value_str in {"male", "m"}:
            return "Male"
        if value_str in {"female", "f"}:
            return "Female"
        return "Other"

    def _encode_gender(self, gender: str) -> int:
        mapping = {"Female": 0, "Male": 1, "Other": 2}
        return mapping.get(gender, 2)

    def _to_records(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        return [self._serialize_row(row) for row in df.to_dict(orient="records")]

    def _serialize_row(self, row: Dict[str, Any]) -> Dict[str, Any]:
        clean: Dict[str, Any] = {}
        for key, value in row.items():
            if isinstance(value, (np.integer, np.int64, np.int32)):
                clean[key] = int(value)
            elif isinstance(value, (np.floating, np.float64, np.float32)):
                clean[key] = float(value)
            elif pd.isna(value):
                clean[key] = None
            else:
                clean[key] = value
        return clean


data_service = DataService()
