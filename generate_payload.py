import json
import joblib

features = joblib.load("models/feature_columns.joblib")

payload = {
    "features": {
        feature: 0
        for feature in features
    }
}

print(json.dumps(payload, indent=2))