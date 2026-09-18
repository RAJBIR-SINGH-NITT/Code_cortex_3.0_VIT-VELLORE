import math


class FeatureValidator:

    def __init__(self, expected_features):
        self.expected_features = expected_features

    def validate(self, features: dict):

        if not isinstance(features, dict):
            raise ValueError("Features must be provided as a dictionary")

        # Check missing features
        missing = [
            feature
            for feature in self.expected_features
            if feature not in features
        ]

        if missing:
            raise ValueError(
                f"Missing required features: {missing}"
            )

        # Check values
        invalid = []

        for feature in self.expected_features:
            value = features[feature]

            if not isinstance(value, (int, float)):
                invalid.append(
                    f"{feature}: must be numeric"
                )
                continue

            if not math.isfinite(value):
                invalid.append(
                    f"{feature}: NaN/Infinity not allowed"
                )

        if invalid:
            raise ValueError(
                f"Invalid feature values: {invalid}"
            )

        # Keep only expected features
        return {
            feature: features[feature]
            for feature in self.expected_features
        }