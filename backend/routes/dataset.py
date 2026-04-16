from io import BytesIO
from typing import List

from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from fastapi.responses import StreamingResponse

from models.schemas import (
    AggregationResponse,
    ClusteringResponse,
    CustomerCreate,
    CustomerUpdate,
    CustomersResponse,
    QuantileResponse,
    StatisticsResponse,
)
from services.data_service import data_service

router = APIRouter(prefix="/api", tags=["Banking Customer Segmentation"])


@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    content = await file.read()
    try:
        result = data_service.load_csv(content)
        return result
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/preprocess")
def preprocess_dataset():
    try:
        return data_service.preprocess()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/customers", response_model=CustomersResponse)
def list_customers(
    age_min: float | None = Query(None),
    age_max: float | None = Query(None),
    income_min: float | None = Query(None),
    income_max: float | None = Query(None),
    spending_min: float | None = Query(None),
    spending_max: float | None = Query(None),
):
    try:
        return data_service.get_customers(
            age_min=age_min,
            age_max=age_max,
            income_min=income_min,
            income_max=income_max,
            spending_min=spending_min,
            spending_max=spending_max,
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/customers")
def create_customer(payload: CustomerCreate):
    try:
        return data_service.add_customer(payload)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.put("/customers/{customer_id}")
def update_customer(customer_id: str, payload: CustomerUpdate):
    try:
        return data_service.update_customer(customer_id, payload)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.delete("/customers/{customer_id}")
def delete_customer(customer_id: str):
    try:
        return data_service.delete_customer(customer_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/operations/aggregations", response_model=AggregationResponse)
def get_aggregations():
    try:
        return {"summary": data_service.get_aggregations()}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/operations/quantiles", response_model=QuantileResponse)
def get_quantiles(
    column: str = Query(..., description="Column name to calculate quantiles for"),
    q: str = Query("0.25,0.5,0.75", description="Comma-separated quantiles"),
):
    try:
        quantiles: List[float] = [float(value.strip()) for value in q.split(",") if value.strip()]
        if not quantiles:
            raise ValueError("At least one quantile is required.")
        return data_service.get_quantiles(column, quantiles)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/statistics", response_model=StatisticsResponse)
def get_statistics():
    try:
        return data_service.get_statistics()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/cluster", response_model=ClusteringResponse)
def cluster_customers(clusters: int = Query(3, ge=3, le=5)):
    try:
        return data_service.run_clustering(clusters)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/export")
def export_dataset():
    try:
        csv_bytes = data_service.export_csv()
        return StreamingResponse(
            BytesIO(csv_bytes),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=processed_customers.csv"},
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
