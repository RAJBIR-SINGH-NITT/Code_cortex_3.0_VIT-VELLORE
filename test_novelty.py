from app.novelty import NoveltyModel


model = NoveltyModel()

sample = {
    feature: 0
    for feature in model.features
}

score = model.score(sample)

print("\nNovelty score:", score)