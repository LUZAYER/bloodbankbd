#!/usr/bin/env python3
"""
BloodLink - Machine Learning Donor Ranking Model Trainer (Feature 2)
Trains a Random Forest Classifier using Scikit-Learn to compute donor recommendation scores.

NOTE ON DATASET INTEGRITY & DEMONSTRATION DISCLOSURE:
This model is trained on a realistic, statistically calibrated demonstration dataset 
simulating Bangladesh emergency blood donation requests, donor response friction,
geographic distance decay, and clinical cooldown periods.
Never claim synthetic data is real hospital EHR data.
Medical ABO/Rh compatibility rules strictly gate candidate selection.
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, roc_auc_score, precision_score, recall_score, classification_report


def generate_demonstration_dataset(n_samples=3000, random_seed=42):
    """
    Synthesize realistic donor response behavior based on healthcare operational dynamics:
    - Compatibility (1.0 exact, 0.9 compatible, 0.0 incompatible)
    - Distance friction (farther distance decreases probability of timely arrival)
    - Availability status (available donors significantly more likely to respond)
    - Cooldown period (>=90 days safe to donate; <90 days medically restrained)
    - Donation experience (experienced donors have higher reliability)
    - Historical response rate
    - Urgency level (1=Normal, 2=Urgent, 3=Emergency)
    """
    np.random.seed(random_seed)

    # 1. Compatibility
    compat_scores = np.random.choice([1.0, 0.9, 0.0], size=n_samples, p=[0.55, 0.35, 0.10])

    # 2. Distance in KM (mostly 0.5km to 30km, skewed towards urban proximity)
    distances = np.random.exponential(scale=6.0, size=n_samples) + 0.5
    distances = np.clip(distances, 0.2, 50.0)

    # 3. Availability (1 = available, 0 = unavailable)
    availability = np.random.choice([1, 0], size=n_samples, p=[0.75, 0.25])

    # 4. Days since last donation (30 to 400 days)
    days_since = np.random.randint(30, 365, size=n_samples)

    # 5. Total previous donations (0 to 12)
    prev_donations = np.random.poisson(lam=3.5, size=n_samples)
    prev_donations = np.clip(prev_donations, 0, 20)

    # 6. Historical response rate (60% to 100%)
    response_rates = np.random.normal(loc=88.0, scale=8.0, size=n_samples)
    response_rates = np.clip(response_rates, 50.0, 100.0)

    # 7. Urgency (1 = Normal, 2 = Urgent, 3 = Emergency)
    urgency = np.random.choice([1, 2, 3], size=n_samples, p=[0.50, 0.35, 0.15])

    # Compute Ground Truth Target: Successful Donor Recommendation & Fulfilled Response (1 or 0)
    # Biological safety is absolute: Incompatible donors (0.0) can never be recommended
    eligible_cooldown = (days_since >= 90).astype(int)

    # Latent response utility function
    latent_score = (
        compat_scores * 35.0 +
        availability * 25.0 +
        eligible_cooldown * 15.0 +
        (1.0 / (1.0 + distances * 0.15)) * 15.0 +
        (response_rates / 100.0) * 10.0 +
        np.clip(prev_donations * 1.0, 0, 8.0)
    )

    # Adjust for emergency demand
    latent_score += (urgency - 1) * 2.0

    # Probability with sigmoid
    prob = 1.0 / (1.0 + np.exp(-(latent_score - 55.0) / 8.0))
    # Zero out incompatible donors for medical safety
    prob[compat_scores == 0.0] = 0.0
    # Zero out unavailable donors
    prob[availability == 0] *= 0.1

    y = (np.random.rand(n_samples) < prob).astype(int)

    df = pd.DataFrame({
        "compat_score": compat_scores,
        "distance_km": distances,
        "is_available": availability,
        "days_since_donation": days_since,
        "prev_donations": prev_donations,
        "response_rate": response_rates,
        "urgency": urgency,
        "recommended": y
    })

    return df


def train_and_save_model(output_dir="models"):
    os.makedirs(output_dir, exist_ok=True)

    print("Generating calibrated demonstration training dataset...")
    df = generate_demonstration_dataset(n_samples=3000, random_seed=42)

    feature_cols = [
        "compat_score",
        "distance_km",
        "is_available",
        "days_since_donation",
        "prev_donations",
        "response_rate",
        "urgency"
    ]

    X = df[feature_cols]
    y = df["recommended"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    print(f"Dataset split: {len(X_train)} training records, {len(X_test)} validation records.")

    # Feature scaling
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Train Random Forest Classifier
    rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=6,
        min_samples_leaf=4,
        random_state=42,
        class_weight="balanced"
    )
    rf.fit(X_train_scaled, y_train)

    # Evaluate
    y_pred = rf.predict(X_test_scaled)
    y_prob = rf.predict_proba(X_test_scaled)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    roc = roc_auc_score(y_test, y_prob)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)

    print("\n--- MODEL EVALUATION METRICS ---")
    print(f"Accuracy:  {acc * 100:.2f}%")
    print(f"ROC-AUC:   {roc:.4f}")
    print(f"Precision: {prec * 100:.2f}%")
    print(f"Recall:    {rec * 100:.2f}%")
    print("\nClassification Report:\n", classification_report(y_test, y_pred))

    # Feature importances
    importances = pd.Series(rf.feature_importances_, index=feature_cols).sort_values(ascending=False)
    print("Feature Importances:\n", importances)

    # Save artifacts
    model_path = os.path.join(output_dir, "donor_ranker.pkl")
    scaler_path = os.path.join(output_dir, "scaler.pkl")
    meta_path = os.path.join(output_dir, "model_meta.json")

    joblib.dump(rf, model_path)
    joblib.dump(scaler, scaler_path)

    import json
    meta = {
        "model_type": "RandomForestClassifier",
        "n_estimators": 100,
        "accuracy": round(float(acc), 4),
        "roc_auc": round(float(roc), 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "feature_importances": {k: round(float(v), 4) for k, v in importances.items()},
        "dataset_type": "Demonstration (Synthetic Healthcare Emergency Dynamics)",
        "medical_safety_guarantee": "ABO/Rh compatibility strictly enforced prior to ranking"
    }

    with open(meta_path, "w") as f:
        json.dump(meta, f, indent=2)

    print(f"\nModel artifacts successfully saved to: {output_dir}")
    return meta


if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(current_dir, "models")
    train_and_save_model(models_dir)
