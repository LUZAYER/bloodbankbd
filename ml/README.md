# BloodBond AI & Machine Learning Microservice

Python-based natural language processing and machine learning donor ranking service for emergency blood matching across Bangladesh.

---

## 🌟 Capabilities

1. **Bilingual NLP Query Parser (`nlp_parser.py`)**:
   - Parses natural conversational emergency queries in both English and Bangla.
   - Extracts blood groups (e.g. `O+`, `ও পজিটিভ`), districts, thanas/areas, and urgency indicators.

2. **Scikit-Learn Donor Ranker (`ranker.py`)**:
   - Uses a trained `RandomForestClassifier` and `StandardScaler` to score eligible donor candidates.
   - Evaluates proximity, donation history, response rates, and verification metrics.

3. **REST Microservice (`app.py`)**:
   - Flask API server providing `/api/parse_query`, `/api/rank`, and `/api/health` endpoints.

---

## 🚀 Setup & Execution

### 1. Prerequisites
- Python 3.10+ (Python 3.11 recommended)
- `pip`

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run Microservice
```bash
python app.py
```
Starts on `http://127.0.0.1:5000`.

### 4. Train & Evaluate Models
```bash
# Train models
python train_model.py

# Evaluate model accuracy
python evaluate.py

# Trigger retraining pipeline
python retrain.py
```

---

## 🐳 Docker Deployment
```bash
docker build -t bloodbond-ml-service .
docker run -p 5000:5000 bloodbond-ml-service
```
