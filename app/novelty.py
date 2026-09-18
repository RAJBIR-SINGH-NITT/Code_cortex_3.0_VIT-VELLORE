import joblib
import pandas as pd


class NoveltyModel:

    def __init__(
        self,
        model_path="models/novelty_model.joblib",
        features_path="models/feature_columns.joblib"
    ):
        self.model = joblib.load(model_path)
        self.features = joblib.load(features_path)

        print(
            f"Loaded novelty model: "
            f"{type(self.model).__name__}"
        )
        print(
            f"Expected features: "
            f"{len(self.features)}"
        )

    def score(self, features: dict) -> float:

        missing = [
            feature
            for feature in self.features
            if feature not in features
        ]

        if missing:
            raise ValueError(
                f"Missing features: {missing}"
            )

        X = pd.DataFrame(
            [[features[feature] for feature in self.features]],
            columns=self.features
        )

        # Isolation Forest:
        # higher decision_function = more normal
        # lower decision_function = more anomalous
        anomaly_score = self.model.decision_function(X)[0]

        return float(anomaly_score)