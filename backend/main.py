from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.dataset import router as dataset_router

app = FastAPI(
    title="Banking Customer Segmentation Dashboard API",
    description="FastAPI backend for customer analytics, CRUD, and clustering.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {"status": "ok", "message": "Banking Customer Segmentation API is running."}


app.include_router(dataset_router)
