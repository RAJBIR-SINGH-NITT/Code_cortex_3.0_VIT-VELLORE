from typing import Any, Dict, List
from pydantic import BaseModel


class AnalyzeRequest(BaseModel):
    features: Dict[str, float]


class EvidenceItem(BaseModel):
    feature: str
    reason: str


class AnalyzeResponse(BaseModel):
    verdict: str
    malware_probability: float
    novelty_score: float
    anomaly_score: float
    confidence: str
    evidence: List[EvidenceItem]