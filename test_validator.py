from app.models import MalwareModel
from app.validator import FeatureValidator


model = MalwareModel()

validator = FeatureValidator(
    model.features
)

# Valid sample
valid_sample = {
    feature: 1
    for feature in model.features
}

print("Testing valid input...")

try:
    result = validator.validate(valid_sample)
    print("PASS: Valid input accepted")
except Exception as e:
    print("FAIL:", e)


# Missing feature
print("\nTesting missing feature...")

bad_sample = valid_sample.copy()
bad_sample.pop(model.features[0])

try:
    validator.validate(bad_sample)
    print("FAIL: Missing feature was accepted")
except ValueError as e:
    print("PASS:", e)


# Invalid value
print("\nTesting invalid value...")

bad_sample = valid_sample.copy()
bad_sample[model.features[0]] = float("nan")

try:
    validator.validate(bad_sample)
    print("FAIL: NaN was accepted")
except ValueError as e:
    print("PASS:", e)