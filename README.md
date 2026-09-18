
# SecureFile AI

## Simple and Explainable Malware Triage for Windows PE Files

SecureFile AI is a practical malware triage system for Windows Portable Executable (PE) files. It combines malware classification, novelty detection, and explainability to produce one of three outcomes:

- `MALWARE`
- `BENIGN`
- `NEEDS_ANALYSIS`

The key idea is to avoid forcing every sample into a binary decision. When a file looks unusual or the model is not confident enough, the system recommends further analysis instead.

---

## At a Glance

| Area | Technology |
|---|---|
| Machine Learning | Python, XGBoost, Scikit-learn, SHAP |
| ML Service | FastAPI |
| Backend | Spring Boot |
| Frontend | React + Vite |
| Database | MongoDB |
| Deployment | Docker / Docker Compose |
| Dataset | Windows PE static features |

---

## Table of Contents

1. [The Problem](#1-the-problem)
2. [Our USP](#2-our-usp)
3. [What the System Does](#3-what-the-system-does)
4. [Machine Learning](#4-machine-learning)
5. [Final Triage Decision](#5-final-triage-decision)
6. [Why the Third Decision Matters](#6-why-the-third-decision-matters)
7. [Dataset](#7-dataset)
8. [PE Features](#8-pe-features)
9. [Dataset Limitations](#9-dataset-limitations)
10. [Data Preprocessing](#10-data-preprocessing)
11. [Scaling](#11-scaling)
12. [Train, Validation and Test Split](#12-train-validation-and-test-split)
13. [Explainability](#13-explainability)
14. [System Architecture](#14-system-architecture)
15. [Why This Architecture](#15-why-this-architecture)
16. [API Flow](#16-api-flow)
17. [API Endpoints](#17-api-endpoints)
18. [Model Artifacts](#18-model-artifacts)
19. [Prediction Interface](#19-prediction-interface)
20. [Web Application](#20-web-application)
21. [Demo Scenarios](#21-demo-scenarios)
22. [Security and Deployment](#22-security-and-deployment)
23. [Project Structure](#23-project-structure)
24. [Team Responsibilities](#24-team-responsibilities)
25. [What Makes the Project Practical](#25-what-makes-the-project-practical)
26. [Limitations](#26-limitations)
27. [Future Improvements](#27-future-improvements)
28. [Why the Project Is Easy to Explain](#28-why-the-project-is-easy-to-explain)
29. [One-Minute Project Explanation](#29-one-minute-project-explanation)
30. [Final Summary](#30-final-summary)
31. [Team](#team)

---

# 1. The Problem

Malware detection is not always a simple yes-or-no problem.

A machine learning model learns from the examples provided during training. When a new file looks very different from those examples, the model may not have enough evidence to make a reliable automatic decision.

A conventional binary classifier still has to choose:

```text
MALWARE
or
BENIGN
````

This can be problematic when the sample is unusual or the model is uncertain.

SecureFile AI introduces a third outcome:

```text
NEEDS_ANALYSIS
```

This means:

* The model is not confident enough.
* The file looks structurally unusual.
* Both signals require further review.

---

# 2. Our USP

The main USP of SecureFile AI is the combination of:

1. Malware classification
2. Novelty detection
3. A separate triage decision

The system does not only ask:

> Does this file look malicious?

It also asks:

> Does this file look unusual compared with the data the model learned from?

The first question is answered by XGBoost.

The second question is answered by Isolation Forest.

The two results are then combined by the Triage Engine.

This produces three outcomes:

```text
MALWARE
BENIGN
NEEDS_ANALYSIS
```

The important part is not simply adding another class.

The system is designed to communicate uncertainty:

> "I do not have enough trustworthy evidence for an automatic decision. Please check this sample further."

This is the central idea of the project.

---

# 3. What the System Does

At a high level, the system follows this pipeline:

```text
Extracted PE Features
        |
        v
Input Validation
        |
        +-----------------------+
        |                       |
        v                       v
XGBoost Classifier       Isolation Forest
        |                       |
        v                       v
Malware Probability      Novelty Score
        |                       |
        +-----------+-----------+
                    |
                    v
              Triage Engine
                    |
          +---------+---------+
          |         |         |
          v         v         v
       MALWARE   BENIGN   NEEDS_ANALYSIS
                    |
                    v
               SHAP Evidence
                    |
                    v
               Web Dashboard
```

---

# 4. Machine Learning

## 4.1 XGBoost

XGBoost is the main malware classifier.

It analyzes static PE features and estimates how strongly the sample resembles malware.

The model returns a probability between `0` and `1`.

For example:

```text
0.95  -> Strong malware evidence
0.08  -> Strong benign evidence
0.50  -> Unclear
```

For inference, the malware probability is obtained using:

```python
model.predict_proba(x)[0, 1]
```

The class mapping used by the model is:

```text
0 -> benign
1 -> malware
```

The model can also return the predicted class directly:

```python
model.predict(x)
```

---

## 4.2 Isolation Forest

Isolation Forest is used for novelty detection.

It answers a different question:

> Does this sample look unusual compared with the training data?

A lower novelty score means the sample looks more familiar.

A higher novelty score means the sample looks more unusual.

Example interpretation:

```text
0.10 -> Looks familiar
0.50 -> Somewhat unusual
0.95 -> Very unusual
```

Isolation Forest is not being presented as a zero-day detector.

It is a novelty detector.

---

# 5. Final Triage Decision

The final result is produced by combining:

* Malware probability
* Novelty score
* Selected thresholds
* Confidence rules

The simplified decision logic is:

```text
High malware probability
        AND
Low novelty
        |
        v
    MALWARE
```

```text
Low malware probability
        AND
Low novelty
        |
        v
     BENIGN
```

```text
Uncertain prediction
        OR
High novelty
        |
        v
NEEDS_ANALYSIS
```

The thresholds are selected using validation data and then frozen before the final test evaluation.

The final test set is not used to choose the thresholds.

---

# 6. Why the Third Decision Matters

Suppose the model sees a file with a feature pattern that is very different from the samples it learned from.

A conventional binary system may still return:

```text
BENIGN
```

or:

```text
MALWARE
```

SecureFile AI can instead return:

```text
NEEDS_ANALYSIS
```

This does not mean the file is definitely malicious.

It means:

> The system does not have enough trustworthy evidence for an automatic decision, so further analysis is recommended.

This helps prevent the system from giving a false sense of certainty.

---

# 7. Dataset

The system uses a Windows PE static-feature malware dataset containing approximately:

* 138,000 samples
* 54 usable static features

The target column is:

```text
legitimate
```

Its original meaning is:

```text
1 -> benign
0 -> malware
```

For model training, this is converted to:

```python
is_malware = 1 - legitimate
```

The resulting model labels are:

```text
1 -> malware
0 -> benign
```

---

# 8. PE Features

PE stands for Portable Executable.

Windows executable files such as `.exe` and `.dll` files follow the PE format.

Instead of executing a file, the dataset provides information about its internal structure.

The features include:

* PE header information
* Section information
* Section sizes
* Section entropy
* Imports
* Exports
* Resources
* Debug information
* Other PE metadata

In simple terms:

> We analyze how the Windows file is structured rather than executing the file.

---

# 9. Dataset Limitations

The current dataset contains extracted static features.

It does not contain:

* Raw executable binaries
* Runtime behaviour
* API-call traces
* Network traffic
* Command-line behaviour
* Malware family labels
* AI-generated-malware labels
* Supply-chain labels

Because of this, the current system does not claim to directly detect:

* Zero-day malware
* AI-generated malware
* Fileless malware
* All polymorphic malware
* Supply-chain malware

The defensible claim is:

> We add a novelty-aware third decision to static PE malware classification so unusual or uncertain samples can be sent for further analysis.

---

# 10. Data Preprocessing

The preprocessing pipeline is designed to remain simple and reproducible.

## Step 1: Remove Identifier Columns

If present, columns such as:

```text
Name
md5
```

are removed.

These identify individual samples and are not useful as general malware structure.

## Step 2: Keep Usable Numeric Features

The model works with the numeric PE features available in the dataset.

## Step 3: Handle Infinite Values

Positive and negative infinity values are converted to missing values.

## Step 4: Handle Missing Values

Missing numeric values are filled using the median calculated from the training data.

The same training medians are then used for:

* Validation
* Test
* Inference

This keeps training and inference consistent.

---

# 11. Scaling

No standard scaler is used.

The pipeline does not use:

```text
StandardScaler
MinMaxScaler
RobustScaler
```

The reason is that XGBoost and Isolation Forest are tree-based methods and do not require feature scaling for this pipeline.

---

# 12. Train, Validation and Test Split

The dataset is divided into:

```text
64% -> Training
16% -> Validation
20% -> Final Test
```

The split is stratified and uses a fixed random seed.

The purpose of each split is:

```text
Training
    |
    +-> Learn the models

Validation
    |
    +-> Choose thresholds and tune decisions

Test
    |
    +-> Final evaluation
```

The final test data remains separate from threshold selection.

---

# 13. Explainability

The system does not stop at producing a final verdict.

It also explains the classifier result.

SHAP is used to identify the most important features for a prediction.

The system can return:

* Feature name
* Raw value
* SHAP value
* Direction of influence

Example:

```json
{
  "feature": "SectionsMeanEntropy",
  "raw_value": 6.4,
  "shap_value": 0.31,
  "direction": "towards_malware"
}
```

The web interface displays only the most useful features so that the result remains easy to understand.

---

# 14. System Architecture

The complete architecture is:

```text
                         USER
                           |
                           v
                  +----------------+
                  | React Frontend |
                  |    Port 5173   |
                  +-------+--------+
                          |
                       HTTP/JSON
                          |
                          v
                  +----------------+
                  | Spring Boot    |
                  | Backend :8080  |
                  +---+--------+---+
                      |        |
                   HTTP      MongoDB
                      |        |
                      v        v
                +----------+ +---------+
                | FastAPI  | | MongoDB |
                |  :8000   | | History |
                +----+-----+ +---------+
                     |
                     v
               +-------------+
               | Triage      |
               | Engine      |
               +------+------+
                      |
             +--------+--------+
             |                 |
             v                 v
        +---------+      +---------------+
        | XGBoost |      | Isolation     |
        |         |      | Forest        |
        +----+----+      +-------+-------+
             |                   |
             v                   v
      Malware Probability   Novelty Score
             |                   |
             +---------+---------+
                       |
                       v
                  Final Verdict
                       |
             +---------+---------+
             |         |         |
             v         v         v
          MALWARE   BENIGN   NEEDS_ANALYSIS
                       |
                       v
                  SHAP Evidence
                       |
                       v
                    React UI
```

---

# 15. Why This Architecture?

Each component has one clear responsibility.

| Component        | Main Responsibility          |
| ---------------- | ---------------------------- |
| React            | User interface               |
| Spring Boot      | Main backend and API gateway |
| FastAPI          | ML inference service         |
| XGBoost          | Malware probability          |
| Isolation Forest | Novelty score                |
| Triage Engine    | Final three-way decision     |
| MongoDB          | Scan history                 |
| Docker           | Packaging and deployment     |

This separation makes the project easier to develop, test and maintain.

It also means the frontend does not need to know how the ML models work internally.

---

# 16. API Flow

The browser communicates only with Spring Boot.

```text
React
  |
  | POST /api/v1/triage
  v
Spring Boot
  |
  | POST /v1/triage
  v
FastAPI
  |
  v
ML Models
  |
  v
Triage Result
  |
  v
Spring Boot
  |
  +--> MongoDB
  |
  +--> React
```

The React frontend never calls FastAPI directly.

This keeps the architecture clean and gives Spring Boot one central place to handle:

* Validation
* Errors
* History
* API control
* Frontend responses

---

# 17. API Endpoints

## Spring Boot

```text
POST /api/v1/triage
GET  /api/v1/history
GET  /api/v1/history/{scanId}
GET  /api/v1/health
GET  /api/v1/model-info
```

## FastAPI

```text
POST /v1/triage
```

A typical request contains a sample ID and its extracted PE features.

A typical result contains:

```text
Sample ID
Verdict
Malware probability
Novelty score
Confidence
Top SHAP features
Model version
Novelty model version
Timestamp
```

---

# 18. Model Artifacts

After training, the ML pipeline exports the files required for inference.

Typical artifacts include:

```text
artifacts/
├── xgb_malware_model.joblib
├── iforest_novelty_model.joblib
├── preprocessor.joblib
├── novelty_score_transformer.joblib
├── thresholds.json
├── feature_schema.json
├── shap_feature_names.json
└── model_metadata.json
```

These artifacts ensure that inference uses the same:

* Feature order
* Preprocessing
* Novelty mapping
* Thresholds
* Model versions

as the training pipeline.

---

# 19. Prediction Interface

The classifier exposes standard scikit-learn-style methods.

```python
prediction = model.predict(x)

malware_probability = model.predict_proba(x)[0, 1]
```

The meaning is:

```text
model.predict(x)

    0 -> benign
    1 -> malware
```

and:

```text
model.predict_proba(x)[0, 1]

    -> malware probability
```

The inference service combines the malware probability with the novelty score before producing the final verdict.

---

# 20. Web Application

The website is intentionally simple.

The main user journey is:

```text
Home
  |
  v
Analyze a Sample
  |
  v
Choose a Demo Sample
  |
  v
Check Sample
  |
  v
View Result
  |
  +--> Malware Score
  +--> Novelty Score
  +--> Confidence
  +--> Top Evidence
```

The three main results are presented using simple language.

### MALWARE

> The file looks harmful.

### BENIGN

> The file looks safe based on the learned data.

### NEEDS_ANALYSIS

> The file looks unusual or the result is not clear. More checking is recommended.

---

# 21. Demo Scenarios

The live demo should show three simple cases.

## Case 1: Benign

```text
Low malware probability
        +
Low novelty
        |
        v
     BENIGN
```

## Case 2: Malware

```text
High malware probability
        +
Low novelty
        |
        v
     MALWARE
```

## Case 3: Needs Analysis

```text
Uncertain prediction
        OR
High novelty
        |
        v
NEEDS_ANALYSIS
```

The third case is the main part of the demo because it demonstrates the difference between a simple binary classifier and the triage approach.

---

# 22. Security and Deployment

The project is designed as separate services:

```text
Frontend
Backend
FastAPI
MongoDB
```

The services communicate over controlled internal connections.

Security considerations include:

* MongoDB is not exposed directly to the browser.
* FastAPI is not called directly by the browser.
* Model files are mounted read-only inside the ML service.
* Configuration is handled through environment variables.
* Docker is used to keep deployment consistent.

---

# 23. Project Structure

```text
project/
|
├── ml/
│   ├── notebooks/
│   ├── ml_package/
│   │   ├── predictor.py
│   │   ├── triage_rules.py
│   │   └── artifacts/
│
├── ai_system/
│   ├── main.py
│   ├── triage_engine.py
│   └── adapters/
│
├── backend/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   └── model/
│
├── frontend/
│   └── src/
│
├── infra/
│   └── docker-compose.yml
│
├── security/
│
├── ARCHITECTURE.md
├── INTERFACES.md
├── PROJECT_STATE.md
├── TASK_BOARD.md
└── README.md
```

---

# 24. Team Responsibilities

## Rajbir Singh — Machine Learning

Responsible for:

* Data cleaning
* Preprocessing
* Feature engineering
* XGBoost
* Isolation Forest
* Threshold selection
* SHAP
* Evaluation
* Model artifacts

## Kaustubh Nikam — AI Systems

Responsible for:

* FastAPI
* Model integration
* Triage engine
* Confidence logic
* Inference orchestration

## Rahul — Full Stack

Responsible for:

* React
* Spring Boot
* API integration
* Dashboard
* History
* User experience

## Mayank — DevOps and Security

Responsible for:

* Docker
* Deployment
* Environment configuration
* Service security
* CI/CD
* Reliability

---

# 25. What Makes the Project Practical?

The project is intentionally built around a small number of understandable components.

It does not attempt to implement every possible malware security feature.

The current system focuses on one clear problem:

> How can a malware classifier avoid making an automatic yes-or-no decision when the sample looks unfamiliar or the model is not confident?

This keeps the project practical for a hackathon while still providing a clear technical idea.

---

# 26. Limitations

The current version only works with extracted static PE features.

It:

* Does not execute files.
* Does not inspect runtime behaviour.
* Does not inspect network traffic.
* Does not have a direct label for AI-generated malware.
* Does not prove that a sample is a zero-day.
* Does not replace a complete security analysis workflow.

The `NEEDS_ANALYSIS` result simply means:

> Further analysis is recommended.

---

# 27. Future Improvements

Possible future work includes:

* Real executable feature extraction
* Dynamic behaviour analysis
* API-call sequence analysis
* Network behaviour analysis
* Malware family classification
* Analyst feedback
* Model updating
* More external validation datasets
* Better uncertainty calibration

These are future extensions and are not required for the current prototype.

---

# 28. Why the Project Is Easy to Explain

The entire project can be explained through three questions.

### Question 1

**Does the file look harmful?**

XGBoost answers this.

### Question 2

**Does the file look unusual?**

Isolation Forest answers this.

### Question 3

**What should we do with both results?**

The Triage Engine decides:

```text
MALWARE
BENIGN
NEEDS_ANALYSIS
```

That is the core idea.

---

# 29. One-Minute Project Explanation

We built a malware triage system for Windows PE files.

First, XGBoost checks how strongly the file looks like malware.

Then, Isolation Forest checks how unusual the file looks compared with the training data.

We combine both results.

If the malware evidence is strong and the file is not unusual, we return `MALWARE`.

If the benign evidence is strong and the file is not unusual, we return `BENIGN`.

If the prediction is unclear or the file looks very unusual, we return `NEEDS_ANALYSIS`.

We also use SHAP to explain which features influenced the classifier.

The system is connected through React, Spring Boot, FastAPI and MongoDB.

---

# 30. Final Summary

The project can be reduced to this workflow:

```text
LOOK AT THE FILE STRUCTURE
          |
          v
ASK: DOES IT LOOK HARMFUL?
          |
          v
ASK: DOES IT LOOK UNUSUAL?
          |
          v
MAKE A DECISION
          |
     +----+----+----------------+
     |         |                |
     v         v                v
 MALWARE    BENIGN       NEEDS_ANALYSIS
                                |
                                v
                         REVIEW FURTHER
```

The main idea is simple:

> Detect what looks harmful, check what looks unusual, and ask for further analysis when the evidence is not strong enough.

---

# Team

## Garnet_Chronicles

**Code Cortex 3.0**
**VIT Vellore**

### Team Members

* **Rajbir Singh** — Machine Learning
* **Kaustubh Nikam** — AI Systems
* **Rahul** — Full Stack
* **Mayank** — DevOps and Security

```
```
