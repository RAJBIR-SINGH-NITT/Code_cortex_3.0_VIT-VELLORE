# Code_cortex_3.0_VIT-VELLORE
Here we are building a complete ml working protype along with full deploying and api integration with the frontend and backend

# UNKNOWN-FIRST(Novelty-Aware Malware Triage System)

> **Don't force every file into MALWARE or BENIGN. Give the system a third answer: `NEEDS_ANALYSIS`.**

##  Problem

Traditional malware classifiers usually give a simple answer:

- **MALWARE**
- **BENIGN**

This can be risky when a file is modified, unusual, or looks different from the examples the model has already learned.

Modern threats can also be changed or assisted by AI tools, making simple yes/no detection less reliable for unfamiliar samples.

##  Our Solution

**UNKNOWN-FIRST** is a malware triage system for Windows PE files.

It uses:

1. **XGBoost** to predict how likely the sample is to be malware.
2. **Isolation Forest** to check whether the sample looks unusual compared with known training data.
3. A **triage layer** that combines both signals and decides:

| Verdict | Meaning |
|---|---|
| **MALWARE** | Strong malware prediction and the sample is not highly unusual |
| **BENIGN** | Strong benign prediction and the sample is not highly unusual |
|  **NEEDS_ANALYSIS** | The prediction is uncertain or the sample looks structurally unusual |

### Our key idea

Instead of asking only:

> **"Is this file malware?"**

we also ask:

> **"Does this file look different from what the model already knows?"**

That second question helps us avoid blindly trusting a confident-looking prediction on an unfamiliar sample.

---

#  What Makes It Different?

The main feature of our project is the **`NEEDS_ANALYSIS`** verdict.

A sample can be sent for further review when:

- the malware probability is between the normal decision boundaries,
- the file looks structurally unusual,
- or both signals disagree.

This makes the system **novelty-aware** instead of relying only on binary classification.

### Important clarification

The current dataset contains **extracted static PE features**, not labels for "AI-generated malware".

Therefore, our system does **not** claim to identify AI-generated malware directly.

Instead, the system can flag a sample as **unusual / novel / uncertain**, including modified samples that may not closely resemble the training data.

---

#  How It Works

```text
              SAMPLE FEATURES
                     │
                     ▼
             Input Validation
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
   XGBoost Classifier      Isolation Forest
          │                     │
          │                     │
 Malware Probability      Novelty Score
          └──────────┬──────────┘
                     ▼
              Triage Engine
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
    MALWARE       BENIGN     NEEDS_ANALYSIS
                     │
                     ▼
              Explanation
          + Top Important Features
```

---

#  Machine Learning

## 1. XGBoost - Malware Detection

The XGBoost model learns from the PE features and predicts:

**`malware_probability`**

Example:

```text
0.94 → high malware probability
0.08 → low malware probability
0.52 → uncertain
```

The model is trained using the dataset's `legitimate` target:

```text
legitimate = 1  → BENIGN
legitimate = 0  → MALWARE
```

For our internal model logic, this is converted to:

```text
malware = 1
benign  = 0
```

---

## 2. Isolation Forest - Novelty Detection

The classifier answers:

> "Does this look malicious?"

Isolation Forest answers:

> "Does this look unusual compared with the training data?"

A higher novelty score means the sample is more unusual.

This gives the system a second layer of protection against unfamiliar structures.

---

#  Triage Logic

The system combines the two signals.

The starting decision logic is:

```text
High malware probability
        +
Low novelty
        ↓
     MALWARE
```

```text
Low malware probability
        +
Low novelty
        ↓
     BENIGN
```

```text
Uncertain probability
        OR
High novelty
        ↓
 NEEDS_ANALYSIS
```

The final thresholds are selected using the validation data and then frozen before final test evaluation.

---

#  Explainable Results

The system does not only return a verdict.

It also provides:

- malware probability
- novelty score
- confidence level
- top features influencing the prediction
- model version
- novelty-model version

Example response:

```json
{
  "sample_id": "demo-001",
  "verdict": "NEEDS_ANALYSIS",
  "malware_probability": 0.71,
  "novelty_score": 0.97,
  "confidence": "LOW",
  "top_shap_features": [
    {
      "feature": "SectionsMeanEntropy",
      "raw_value": 6.4,
      "shap_value": 0.31,
      "direction": "towards_malware"
    }
  ],
  "model_version": "xgb-v1",
  "novelty_model_version": "iforest-v1"
}
```

This helps a reviewer understand **why** the model reached its decision.

---

#  System Architecture

```text
React Frontend
     │
     │ HTTP / JSON
     ▼
Spring Boot Backend
     │
     │ HTTP / JSON
     ▼
FastAPI ML Service
     │
     ▼
Triage Engine
 ┌───┴───────────────┐
 ▼                   ▼
XGBoost          Isolation Forest
 ▼                   ▼
Malware Prob.     Novelty Score
 └──────────┬────────┘
            ▼
     Triage Decision
            │
   ┌────────┼─────────┐
   ▼        ▼         ▼
MALWARE   BENIGN   NEEDS_ANALYSIS
            │
            ▼
        MongoDB
      Scan History
```

### Service responsibilities

| Component | Responsibility |
|---|---|
| **React** | User interface and result display |
| **Spring Boot** | Main backend/API and scan history |
| **FastAPI** | ML inference service |
| **XGBoost** | Malware classification |
| **Isolation Forest** | Novelty detection |
| **MongoDB** | Scan/result metadata |
| **Docker** | Service packaging and deployment |

---

# Tech Stack

### Machine Learning

- Python
- XGBoost
- Scikit-learn
- SHAP
- Pandas
- NumPy
- Joblib

### Backend

- Java
- Spring Boot
- MongoDB

### ML API

- FastAPI
- Pydantic

### Frontend

- React

### DevOps / Security

- Docker
- Docker Compose
- GitHub
- CI/CD and security checks

---

# Project Structure

```text
UNKNOWN-FIRST/
│
├── ml/
│   ├── notebooks/
│   └── ml_package/
│       ├── predictor.py
│       ├── triage_rules.py
│       ├── artifacts/
│       │   ├── xgb_malware_model.joblib
│       │   ├── iforest_novelty_model.joblib
│       │   ├── preprocessor.joblib
│       │   ├── novelty_score_transformer.joblib
│       │   ├── thresholds.json
│       │   ├── feature_schema.json
│       │   ├── shap_feature_names.json
│       │   └── model_metadata.json
│       └── README.md
│
├── ai_system/
│   ├── main.py
│   ├── triage_engine.py
│   ├── schemas.py
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
│   ├── docker-compose.yml
│   └── dockerfiles/
│
├── security/
│
├── notebooks/
│
├── README.md
├── CLAUDE.md
├── ARCHITECTURE.md
├── PROJECT_STATE.md
├── INTERFACES.md
└── TASK_BOARD.md
```

---

# Dataset

The project uses a Windows PE static-feature malware dataset containing approximately **138,000 samples** and around **54 usable static features**.

The features describe properties such as:

- PE header information
- section statistics
- section entropy
- imports / exports
- resources
- debug metadata

### Important dataset limitation

The dataset does **not** contain:

- raw executable binaries
- runtime behavior
- network telemetry
- API execution traces
- malware family labels
- AI-generated-malware labels
- supply-chain provenance

Therefore, the current system is a **static-feature malware triage system**, not a complete dynamic malware analysis platform.

---

#  ML Training Pipeline

The training process follows this flow:

```text
Raw Dataset
    ↓
Data Inspection
    ↓
Cleaning
    ↓
Feature Preprocessing
    ↓
Train / Validation / Test Split
    ↓
XGBoost Training
    ↓
Isolation Forest Training
    ↓
Threshold Selection
    ↓
Final Test Evaluation
    ↓
SHAP Explanation
    ↓
Export Model Artifacts
```

The data is split into:

```text
64% → Training
16% → Validation
20% → Final Test
```

The split is stratified and uses a fixed random seed.

The final test set is kept separate from threshold selection.

---

#  Running the ML Notebook

The complete ML pipeline is available as a Google Colab notebook.

Open:

```text
UNKNOWN_FIRST_Malware_Triage_Rajbir_Colab.ipynb
```

Then run the cells in order:

```text
Setup
  ↓
Load Dataset
  ↓
Clean Data
  ↓
Preprocess
  ↓
Train Models
  ↓
Tune Thresholds
  ↓
Evaluate
  ↓
Novelty Stress Test
  ↓
SHAP
  ↓
Export Artifacts
  ↓
Prediction Function
```

The notebook creates the model artifacts required by the inference service.

---

#  ML API

The main inference endpoint is:

```http
POST /v1/triage
```

Example request:

```json
{
  "sample_id": "demo-001",
  "features": {
    "Machine": 332,
    "SectionsMeanEntropy": 6.4,
    "SectionsMinEntropy": 1.2,
    "SectionsMaxEntropy": 7.9,
    "ImportsNb": 87
  }
}
```

> A real request must contain all features required by `feature_schema.json`.

Example response:

```json
{
  "sample_id": "demo-001",
  "verdict": "NEEDS_ANALYSIS",
  "malware_probability": 0.71,
  "novelty_score": 0.97,
  "confidence": "LOW",
  "top_shap_features": [],
  "model_version": "xgb-v1",
  "novelty_model_version": "iforest-v1"
}
```

---

# Backend API

The Spring Boot backend provides:

```text
POST /api/v1/triage
GET  /api/v1/history
GET  /api/v1/history/{scanId}
GET  /api/v1/health
GET  /api/v1/model-info
```

The frontend communicates with **Spring Boot only**.

The browser does not directly call the FastAPI ML service or MongoDB.

---

# Security Design

The project keeps the main services separated:

```text
Browser
   │
   ▼
Spring Boot
   │
   ▼
FastAPI
   │
   ▼
ML Models
```

MongoDB and FastAPI are kept inside the private service network.

The deployment uses Docker-based isolation and environment-based configuration.

The goal is to keep the system simple, secure, and practical for a hackathon deployment.

---

#  Example Use Case

Imagine a file that looks very different from the samples used to train the model.

A normal binary classifier may still be forced to say:

```text
BENIGN
```

or

```text
MALWARE
```

Our system can instead respond:

```text
NEEDS_ANALYSIS
```

with:

```text
Malware Probability → 0.71
Novelty Score       → 0.97
Confidence          → LOW
```

This tells the analyst:

> **"The system is not confident enough to automatically trust this sample. Please review it further."**

That is the core idea of **UNKNOWN-FIRST**.

---

#  Demo Scenarios

For demonstration, the system can show three cases:

### 1. Known Malware

```text
High malware probability
Low novelty
→ MALWARE
```

### 2. Known Benign

```text
Low malware probability
Low novelty
→ BENIGN
```

### 3. Unusual / Uncertain Sample

```text
Uncertain prediction
or high novelty
→ NEEDS_ANALYSIS
```

This makes the project's main idea easy to understand during a live demo.

---

# Future Improvements

The current project focuses on static PE features.

Possible future improvements include:

- dynamic behavioral analysis
- API-call sequence analysis
- network behavior analysis
- malware family classification
- richer analyst feedback
- continuous model updating
- better uncertainty calibration
- real executable feature extraction pipeline
- additional external validation datasets

These are future extensions and are not required for the current MVP.

---

#  Important Scope

**UNKNOWN-FIRST is a malware triage system, not a replacement for a complete security analysis workflow.**

It works on the features available in the current dataset.

The `NEEDS_ANALYSIS` verdict means:

> **"Do not automatically trust this result. Perform further analysis."**

It does not mean that the file is definitely malicious.

---

#  Team

**Team:** Garnet_Chronicles

### Roles

- **Rajbir Singh** — ML / Data Science
- **Kaustubh Nikam** — AI System / ML Integration
- **Rahul** — Full Stack Development
- **Mayank** — DevOps / Cybersecurity

---

#  Project Summary

**UNKNOWN-FIRST** adds a missing decision to malware classification:

```text
MALWARE
BENIGN
NEEDS_ANALYSIS
```

Instead of trusting only the classifier's prediction, the system also checks whether the sample is **novel or structurally unusual**.

This makes the workflow:

```text
DETECT
  ↓
CHECK NOVELTY
  ↓
DECIDE
  ↓
EXPLAIN
  ↓
ESCALATE WHEN NEEDED
```

### One-line pitch

> **UNKNOWN-FIRST is a novelty-aware malware triage system that detects known threats while flagging unusual or uncertain samples for further analysis instead of forcing every file into a risky yes/no decision.**

