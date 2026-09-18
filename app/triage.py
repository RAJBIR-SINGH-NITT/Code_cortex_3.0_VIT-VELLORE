class TriageEngine:

    def __init__(self, malware_model, novelty_model):
        self.malware_model = malware_model
        self.novelty_model = novelty_model

    def analyze(self, features: dict):

        # 1. Get malware probability
        malware_result = self.malware_model.predict(features)

        malware_probability = malware_result["malware_probability"]

        # 2. Get Isolation Forest score
        anomaly_score = self.novelty_model.score(features)

        # 3. Convert anomaly score into a simple novelty score
        # Higher = more unusual
        novelty_score = self._novelty_score(anomaly_score)

        # 4. Make triage decision
        verdict = self._decide(
            malware_probability,
            novelty_score
        )
        confidence = self._confidence(
            malware_probability,
            novelty_score
            )

        return {
            "verdict": verdict,
            "malware_probability": round(
                malware_probability, 4
            ),
            "novelty_score": round(
                novelty_score, 4
            ),
            "anomaly_score": round(
                anomaly_score, 4
            ),
            "confidence": confidence
        }

    def _novelty_score(self, anomaly_score):

        # Temporary calibration.
        # We will replace this with
        # calibration based on validation data.
        score = 0.5 - anomaly_score

        return max(0.0, min(1.0, score))

    def _decide(
        self,
        malware_probability,
        novelty_score
    ):

        if malware_probability >= 0.80:
            return "MALWARE"

        if malware_probability <= 0.20 and novelty_score < 0.70:
            return "BENIGN"

        return "NEEDS_ANALYSIS"
    def _confidence(self, malware_probability, novelty_score):

    # Strong classifier signal
        if malware_probability >= 0.80 or malware_probability <= 0.20:
            if novelty_score < 0.70:
                return "HIGH"

    # Uncertain or unfamiliar sample
        if 0.30 <= malware_probability <= 0.70:
            return "LOW"

    # Everything in between
        return "MEDIUM"