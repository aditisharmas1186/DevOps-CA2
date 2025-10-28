from fastapi import FastAPI
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response
import time

app = FastAPI(title="EHR Backend")

# --- Prometheus metrics ---
REQUEST_COUNT = Counter("ehr_requests_total", "Total HTTP requests", ["method", "endpoint"])
REQUEST_LATENCY = Histogram("ehr_request_latency_seconds", "Request latency", ["endpoint"])

@app.middleware("http")
async def metrics_middleware(request, call_next):
    start = time.time()
    response = await call_next(request)
    latency = time.time() - start
    REQUEST_COUNT.labels(request.method, request.url.path).inc()
    REQUEST_LATENCY.labels(request.url.path).observe(latency)
    return response

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/patients")
def get_patients():
    patients = [
        {"id": 1, "name": "Alice Johnson", "age": 32, "condition": "Diabetes"},
        {"id": 2, "name": "Bob Smith", "age": 45, "condition": "Hypertension"},
    ]
    return patients

@app.get("/patients/{id}")
def get_patient(id: int):
    return {"id": id, "name": "Patient " + str(id), "condition": "Unknown"}

@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
