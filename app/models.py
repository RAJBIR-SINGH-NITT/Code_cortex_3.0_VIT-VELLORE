import joblib
import pandas as pd
from xgboost import XGBClassifier


class MalwareModel:

    def __init__(
        self,
        model_path="models/malware_model.json",
        features_path="models/feature_columns.joblib"
    ):
        self.model = XGBClassifier()
        self.model.load_model(model_path)

        self.features = joblib.load(features_path)

        print(f"Loaded model: {type(self.model).__name__}")
        print(f"Expected features: {len(self.features)}")

    def predict(self, features: dict) -> dict:

        missing = [
            feature
            for feature in self.features
            if feature not in features
        ]

        if missing:
            raise ValueError(
                f"Missing features: {missing}"
            )

        # Maintain exact training feature order
        X = pd.DataFrame(
            [[features[feature] for feature in self.features]],
            columns=self.features
        )

        prediction = int(self.model.predict(X)[0])
        probabilities = self.model.predict_proba(X)[0]

        malware_probability = float(probabilities[1])
        benign_probability = float(probabilities[0])

        return {
            "prediction": prediction,
            "malware_probability": malware_probability,
            "benign_probability": benign_probability
        }