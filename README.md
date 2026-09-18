SecureFile AI

Simple and Explainable Malware Triage for Windows PE Files

A practical malware triage system that combines malware prediction and novelty detection and adds a third decision: NEEDS_ANALYSIS.

Area

Technology

Machine Learning

Python, XGBoost, Scikit-learn, SHAP

ML Service

FastAPI

Backend

Spring Boot

Frontend

React + Vite

Database

MongoDB

Deployment

Docker / Docker Compose

Dataset

Windows PE static features

At a Glance

What problem are we solving?

A normal malware classifier is usually forced to say:

MALWARE or BENIGN

Our system adds:

NEEDS_ANALYSIS

when the sample looks unusual or the model is not confident enough.

Core idea

Does it look harmful?
          +
Does it look unusual?
          |
          v
     Final Decision

Three outcomes

Verdict

Meaning

MALWARE

The file looks harmful

BENIGN

The file looks safe based on the learned data

NEEDS_ANALYSIS

The file looks unusual or the result is not clear

Table of Contents

The Problem

Our USP

What the System Does

Machine Learning

Final Triage Decision

Why the Third Decision Matters

Dataset

PE Features

Dataset Limitations

Data Preprocessing

Scaling

Train, Validation and Test Split

Explainability

System Architecture

API Flow

API Endpoints

Model Artifacts

Prediction Interface

Web Application

Demo Scenarios

Security and Deployment

Project Structure

Team Responsibilities

What Makes the Project Practical

Limitations

Future Improvements

Why the Project Is Easy to Explain

One-Minute Project Explanation

Final Summary

1. The Problem

Malware detection is not always a simple yes-or-no problem.

A machine learning model learns from the examples given to it during training. When a new file looks very different from those examples, the model may not have enough evidence to make a reliable automatic decision.

A normal binary classifier still has to choose:

MALWARE
or
BENIGN

That can be a problem when the sample is unusual or the model is uncertain.

Our system handles this situation with a third outcome:

NEEDS_ANALYSIS

This means:

the model is not confident enough, or

the file looks structurally unusual, or

both signals need further review.

2. Our USP

The main USP of this project is the combination of:

Malware classification

Novelty detection

A separate triage decision

The system does not only ask:

Does this file look malicious?

It also asks:

Does this file look unusual compared with the data the model learned from?

The first question is answered by XGBoost.

The second question is answered by Isolation Forest.

The two results are then combined by the triage engine.

This gives the system three clear outcomes:

MALWARE
BENIGN
NEEDS_ANALYSIS

The important part is not simply adding another class.

The important part is allowing the system to say:

"I do not have enough trustworthy evidence for an automatic decision. Please check this sample further."

This is the central idea of the project.

3. What the System Does

At a high level, the system works like this:

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
             SHAP Explanation
                    |
                    v
              Web Dashboard

4. How the Machine Learning Works

4.1 XGBoost

XGBoost is the main malware classifier.

It looks at the static PE features and estimates how strongly the sample looks like malware.

The model returns a probability between 0 and 1.

For example:

0.95  -> strong malware evidence
0.08  -> strong benign evidence
0.50  -> unclear

For inference, the malware probability is taken from:

model.predict_proba(x)[0, 1]

The class mapping used by the model is:

0 -> benign
1 -> malware

The model can also return the class directly with:

model.predict(x)

4.2 Isolation Forest

Isolation Forest is used for novelty detection.

It answers a different question:

Does this sample look unusual compared with the training data?

A lower novelty score means the sample looks more familiar.

A higher novelty score means the sample looks more unusual.

Example:

0.10 -> looks familiar
0.50 -> somewhat unusual
0.95 -> very unusual

Isolation Forest is not being presented as a zero-day detector.

It is a novelty detector.

5. Final Triage Decision

The final result is produced by combining:

malware probability

novelty score

selected thresholds

confidence rules

The simplified decision is:

High malware probability
and
Low novelty
        |
        v
     MALWARE

Low malware probability
and
Low novelty
        |
        v
      BENIGN

Uncertain prediction
or
High novelty
        |
        v
  NEEDS_ANALYSIS

The thresholds are selected using validation data and then frozen before the final test evaluation.

The final test set is not used to choose the thresholds.

6. Why the Third Decision Matters

Suppose the model sees a file with a feature pattern that is very different from the samples it learned from.

A normal binary system may still return:

BENIGN

or:

MALWARE

Our system can instead return:

NEEDS_ANALYSIS

This does not mean the file is definitely malicious.

It means:

The system does not have enough trustworthy evidence for an automatic decision, so further analysis is recommended.

This helps prevent the system from giving a false sense of certainty.

7. Dataset

The system uses a Windows PE static-feature malware dataset with approximately:

138,000 samples
about 54 usable static features

The target column is:

legitimate

Its meaning is:

1 -> benign
0 -> malware

For model training, this is converted to:

is_malware = 1 - legitimate

So the model uses:

1 -> malware
0 -> benign

8. What Are PE Features?

PE means Portable Executable.

Windows executable files such as EXE and DLL files follow the PE format.

Instead of running a file, the dataset provides information about its internal structure.

The features include things such as:

PE header information

section information

section sizes

section entropy

imports

exports

resources

debug information

other PE metadata

In simple words:

We look at how the Windows file is built rather than running the file.

9. Dataset Limitations

The current dataset contains extracted static features.

It does not contain:

raw executable binaries

runtime behaviour

API-call traces

network traffic

command-line behaviour

malware family labels

AI-generated-malware labels

supply-chain labels

Because of this, the current system does not claim to directly detect:

zero-day malware

AI-generated malware

fileless malware

all polymorphic malware

supply-chain malware

The defensible claim is:

We add a novelty-aware third decision to static PE malware classification so unusual or uncertain samples can be sent for further analysis.

10. Data Preprocessing

The preprocessing is kept simple and reproducible.

Step 1: Remove identifier columns

If present, columns such as:

Name
md5

are removed.

These identify individual samples and are not useful as general malware structure.

Step 2: Keep the usable numeric features

The model works with the numeric PE features available in the dataset.

Step 3: Handle infinite values

Positive and negative infinity values are converted to missing values.

Step 4: Handle missing values

Missing numeric values are filled using the median calculated from the training data.

The same training medians are then used for:

validation

test

inference

This keeps training and inference consistent.

11. Scaling

No standard scaler is used.

The pipeline does not use:

StandardScaler
MinMaxScaler
RobustScaler

The reason is simple:

XGBoost and Isolation Forest are tree-based methods and do not require feature scaling for this pipeline.

12. Train, Validation and Test Split

The data is separated into:

64% -> training
16% -> validation
20% -> final test

The split is stratified and uses a fixed random seed.

The roles are:

Training
    |
    -> learn the models

Validation
    |
    -> choose thresholds and tune decisions

Test
    |
    -> final evaluation

The final test data is kept separate from threshold selection.

13. Explainability

The system does not stop at a final verdict.

It also explains the classifier result.

We use SHAP to identify the most important features for a prediction.

The system can return:

feature name

raw value

SHAP value

direction of influence

Example:

{
  "feature": "SectionsMeanEntropy",
  "raw_value": 6.4,
  "shap_value": 0.31,
  "direction": "towards_malware"
}

The web interface shows only the most useful features so that the result remains easy to understand.

14. End-to-End Architecture

The complete architecture is:

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
               | :8000    | | History |
               +----+-----+ +---------+
                    |
                    v
              +-------------+
              | Triage      |
              | Engine      |
              +------+------+
                     |
          +----------+----------+
          |                     |
          v                     v
     +---------+         +---------------+
     | XGBoost |         | Isolation     |
     |         |         | Forest        |
     +----+----+         +-------+-------+
          |                      |
          v                      v
   Malware Probability      Novelty Score
          |                      |
          +----------+-----------+
                     |
                     v
              Final Verdict
                     |
         +-----------+-----------+
         |           |           |
         v           v           v
      MALWARE     BENIGN   NEEDS_ANALYSIS
                     |
                     v
               SHAP Evidence
                     |
                     v
                React UI

15. Why This Architecture?

Each part has one clear responsibility.

Component

Main responsibility

React

User interface

Spring Boot

Main backend and API gateway

FastAPI

ML inference service

XGBoost

Malware probability

Isolation Forest

Novelty score

Triage Engine

Final three-way decision

MongoDB

Scan history

Docker

Packaging and deployment

This separation makes the project easier to develop, test and maintain.

It also means the frontend does not need to know how the ML models work internally.

16. API Flow

The browser talks only to Spring Boot.

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

The React frontend never calls FastAPI directly.

This keeps the architecture clean and gives Spring Boot one central place to handle:

validation

errors

history

API control

frontend responses

17. API Endpoints

Spring Boot

POST /api/v1/triage
GET  /api/v1/history
GET  /api/v1/history/{scanId}
GET  /api/v1/health
GET  /api/v1/model-info

FastAPI

POST /v1/triage

A typical request contains a sample ID and its extracted PE features.

A typical result contains:

sample ID
verdict
malware probability
novelty score
confidence
top SHAP features
model version
novelty model version
timestamp

18. Model Artifacts

After training, the ML pipeline exports the files needed for inference.

Typical artifacts are:

artifacts/
├── xgb_malware_model.joblib
├── iforest_novelty_model.joblib
├── preprocessor.joblib
├── novelty_score_transformer.joblib
├── thresholds.json
├── feature_schema.json
├── shap_feature_names.json
└── model_metadata.json

These artifacts make sure that inference uses the same:

feature order

preprocessing

novelty mapping

thresholds

model versions

as the training pipeline.

19. Prediction Interface

The classifier exposes the standard scikit-learn style methods:

prediction = model.predict(x)

malware_probability = model.predict_proba(x)[0, 1]

The meaning is:

model.predict(x)
    |
    +-> 0 = benign
    +-> 1 = malware

and:

model.predict_proba(x)[0, 1]
    |
    +-> malware probability

The inference service then combines the probability with the novelty score before producing the final verdict.

20. Web Application

The website is intentionally simple.

The main user journey is:

Home
  |
  v
Analyze a Sample
  |
  v
Choose a demo sample
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

The three main results are presented with simple language:

MALWARE

"The file looks harmful."

BENIGN

"The file looks safe based on the learned data."

NEEDS_ANALYSIS

"The file looks unusual or the result is not clear. More checking is recommended."

21. Demo Scenarios

The live demo should show three simple cases.

Case 1: Benign

Low malware probability
Low novelty
        |
        v
BENIGN

Case 2: Malware

High malware probability
Low novelty
        |
        v
MALWARE

Case 3: Needs Analysis

Uncertain prediction
or
High novelty
        |
        v
NEEDS_ANALYSIS

The third case is the main part of the demo because it shows the difference between a simple binary classifier and our triage approach.

22. Security and Deployment

The project is designed as separate services.

Frontend
Backend
FastAPI
MongoDB

The services communicate over controlled internal connections.

MongoDB is not exposed directly to the browser.

FastAPI is not called directly by the browser.

Model files are mounted read-only inside the ML service.

Configuration is handled through environment variables.

Docker is used to keep deployment consistent.

23. Project Structure

project/
|
+-- ml/
|   +-- notebooks/
|   +-- ml_package/
|       +-- predictor.py
|       +-- triage_rules.py
|       +-- artifacts/
|
+-- ai_system/
|   +-- main.py
|   +-- triage_engine.py
|   +-- adapters/
|
+-- backend/
|   +-- controller/
|   +-- service/
|   +-- repository/
|   +-- model/
|
+-- frontend/
|   +-- src/
|
+-- infra/
|   +-- docker-compose.yml
|
+-- security/
|
+-- ARCHITECTURE.md
+-- INTERFACES.md
+-- PROJECT_STATE.md
+-- TASK_BOARD.md
+-- README.md

24. Team Responsibilities

Rajbir — Machine Learning

Responsible for:

data cleaning

preprocessing

feature work

XGBoost

Isolation Forest

threshold selection

SHAP

evaluation

model artifacts

Kaustubh — AI Systems

Responsible for:

FastAPI

model integration

triage engine

confidence logic

inference orchestration

Rahul — Full Stack

Responsible for:

React

Spring Boot

API integration

dashboard

history

user experience

Mayank — DevOps and Security

Responsible for:

Docker

deployment

environment configuration

service security

CI/CD

reliability

25. What Makes the Project Practical?

The project is intentionally built around a small number of understandable components.

We are not trying to build every possible malware security feature.

The current system focuses on one clear problem:

How can a malware classifier avoid making an automatic yes-or-no decision when the sample looks unfamiliar or the model is not confident?

That keeps the project practical for a hackathon while still giving it a clear technical idea.

26. Limitations

The current version only works with extracted static PE features.

It does not execute files.

It does not inspect runtime behaviour.

It does not inspect network traffic.

It does not have a direct label for AI-generated malware.

It does not prove that a sample is a zero-day.

It does not replace a complete security analysis workflow.

The NEEDS_ANALYSIS result simply means:

Further analysis is recommended.

27. Future Improvements

Possible future work includes:

real executable feature extraction

dynamic behaviour analysis

API-call sequence analysis

network behaviour analysis

malware family classification

analyst feedback

model updating

more external validation datasets

better uncertainty calibration

These are future extensions and are not required for the current prototype.

28. Why the Project Is Easy to Explain

The entire project can be explained in three questions:

Question 1

Does the file look harmful?

XGBoost answers this.

Question 2

Does the file look unusual?

Isolation Forest answers this.

Question 3

What should we do with both results?

The triage engine decides:

MALWARE
BENIGN
NEEDS_ANALYSIS

That is the whole idea.

29. One-Minute Project Explanation

We built a malware triage system for Windows PE files.

First, XGBoost checks how strongly the file looks like malware.

Then, Isolation Forest checks how unusual the file looks compared with the training data.

We combine both results.

If the malware evidence is strong and the file is not unusual, we return MALWARE.

If the benign evidence is strong and the file is not unusual, we return BENIGN.

If the prediction is unclear or the file looks very unusual, we return NEEDS_ANALYSIS.

We also use SHAP to explain which features influenced the classifier.

The system is connected through React, Spring Boot, FastAPI and MongoDB.

30. Final Summary

The project can be reduced to this simple workflow:

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
   +------+-------+--------+
   |              |        |
   v              v        v
MALWARE        BENIGN   NEEDS_ANALYSIS
                          |
                          v
                    REVIEW FURTHER

The main idea is simple:

Detect what looks harmful, check what looks unusual, and ask for further analysis when the evidence is not strong enough.

Team

Garnet_Chronicles

Code Cortex 3.0
VIT Vellore

Team members:

Rajbir Singh — Machine Learning

Kaustubh Nikam — AI Systems

Rahul — Full Stack

Mayank — DevOps and Security
