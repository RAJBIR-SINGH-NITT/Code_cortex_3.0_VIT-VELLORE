import pandas as pd


class EvidenceEngine:

    def __init__(self, reference_data_path=None):
        self.reference_data = None

        if reference_data_path:
            self.reference_data = pd.read_csv(reference_data_path)

    def generate(self, features: dict):

        evidence = []

        # Basic PE feature indicators
        if "SectionsMeanEntropy" in features:
            entropy = features["SectionsMeanEntropy"]

            if entropy >= 7.0:
                evidence.append({
                    "feature": "SectionsMeanEntropy",
                    "reason": "High section entropy may indicate packing or obfuscation"
                })

        if "ImportsNb" in features:
            imports = features["ImportsNb"]

            if imports <= 2:
                evidence.append({
                    "feature": "ImportsNb",
                    "reason": "Very low import count indicates an unusual import profile"
                })

        if "SectionsNb" in features:
            sections = features["SectionsNb"]

            if sections >= 10:
                evidence.append({
                    "feature": "SectionsNb",
                    "reason": "Unusually large number of PE sections"
                })

        if "ResourcesNb" in features:
            resources = features["ResourcesNb"]

            if resources >= 20:
                evidence.append({
                    "feature": "ResourcesNb",
                    "reason": "Large resource structure detected"
                })

        return evidence