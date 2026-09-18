from fastapi import FastAPI, HTTPException

from app.inference import MalwareInference
from app.schemas import AnalyzeRequest, AnalyzeResponse


app = FastAPI(
    title="Novelty-Aware Malware Triage API",
    description="AI-powered malware detection and novelty-aware triage system",
    version="1.0.0"
)


# Load models once when the API starts
engine = MalwareInference()


@app.get("/")
def root():
    return {
        "message": "Novelty-Aware Malware Triage API",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest):

    try:
        result = engine.analyze(request.features)

        return result

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Inference failed"
        )