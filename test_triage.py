from app.models import MalwareModel
from app.novelty import NoveltyModel
from app.triage import TriageEngine


malware_model = MalwareModel()
novelty_model = NoveltyModel()

triage = TriageEngine(
    malware_model,
    novelty_model
)

sample = {
    feature: 0
    for feature in malware_model.features
}

result = triage.analyze(sample)

print("\n===== TRIAGE RESULT =====")
print("Verdict:", result["verdict"])
print("Malware probability:", result["malware_probability"])
print("Novelty score:", result["novelty_score"])
print("Anomaly score:", result["anomaly_score"])