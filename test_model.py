from app.models import MalwareModel


model = MalwareModel()

sample = {
    feature: 0
    for feature in model.features
}

result = model.predict(sample)

print("\nPrediction result:")
print(result)