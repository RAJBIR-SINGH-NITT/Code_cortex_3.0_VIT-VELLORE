import joblib

features = joblib.load("models/feature_columns.joblib")

print("Number of features:", len(features))
print("\nFeatures:")

for i, feature in enumerate(features, start=1):
    print(f"{i}. {feature}")