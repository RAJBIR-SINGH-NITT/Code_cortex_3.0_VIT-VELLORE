from app.models import MalwareModel
from app.novelty import NoveltyModel
from app.triage import TriageEngine
from app.validator import FeatureValidator
from app.evidence import EvidenceEngine


class MalwareInference:

    def __init__(self):
        self.malware_model = MalwareModel()
        self.novelty_model = NoveltyModel()

        self.validator = FeatureValidator(
            self.malware_model.features
        )

        self.triage = TriageEngine(
            self.malware_model,
            self.novelty_model
        )

        self.evidence = EvidenceEngine()

    def analyze(self, features: dict):

        # 1. Validate input
        features = self.validator.validate(features)

        # 2. Run ML + triage
        result = self.triage.analyze(features)

        # 3. Generate supporting evidence
        result["evidence"] = self.evidence.generate(features)

        return result