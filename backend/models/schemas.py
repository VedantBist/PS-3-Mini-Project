from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class CustomerBase(BaseModel):
    CustomerID: str = Field(..., description="Unique identifier for the customer")
    Age: int = Field(..., ge=0, le=120)
    Gender: str = Field(..., description="Gender label used for encoding")
    AnnualIncome: float = Field(..., ge=0)
    SpendingScore: float = Field(..., ge=0, le=100)
    Balance: float = Field(...)


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    Age: Optional[int] = Field(None, ge=0, le=120)
    Gender: Optional[str] = None
    AnnualIncome: Optional[float] = Field(None, ge=0)
    SpendingScore: Optional[float] = Field(None, ge=0, le=100)
    Balance: Optional[float] = None


class AggregationResponse(BaseModel):
    summary: Dict[str, Dict[str, float]]


class StatisticsResponse(BaseModel):
    mean: Dict[str, float]
    median: Dict[str, float]
    std: Dict[str, float]


class QuantileResponse(BaseModel):
    column: str
    quantiles: Dict[str, float]


class CustomersResponse(BaseModel):
    total: int
    data: List[Dict[str, Any]]


class ClusteringResponse(BaseModel):
    clusters: int
    labels: List[int]
    centroids: List[List[float]]
