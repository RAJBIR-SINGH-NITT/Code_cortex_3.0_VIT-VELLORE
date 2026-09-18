import json
from app.inference import MalwareInference

engine = MalwareInference()

sample = {
    feature: 0
    for feature in engine.malware_model.features
}

print(json.dumps({
    "features": sample
}, indent=2))