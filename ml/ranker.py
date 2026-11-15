#!/usr/bin/env python3
"""
BloodLink - Machine Learning Donor Ranking Engine (Feature 2)
Infers recommendation scores and explainable reasons for donor candidates
using Scikit-Learn Random Forest and medical ABO/Rh safety verification.
"""

import os
import sys
import json
import joblib
import warnings
warnings.filterwarnings("ignore")
import numpy as np
import pandas as pd
from datetime import datetime

# RBC Compatibility Rules
COMPATIBILITY_MAP = {
    'A+':  ['A+', 'A-', 'O+', 'O-'],
    'A-':  ['A-', 'O-'],
    'B+':  ['B+', 'B-', 'O+', 'O-'],
    'B-':  ['B-', 'O-'],
    'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
    'AB-': ['AB-', 'A-', 'B-', 'O-'],
    'O+':  ['O+', 'O-'],
    'O-':  ['O-']
}

URGENCY_MAP = {
    'Normal': 1,
    'Urgent': 2,
    'Emergency': 3
}

# Lazy model loader
_MODEL = None
_SCALER = None


def load_model_and_scaler():
    global _MODEL, _SCALER
    if _MODEL is None or _SCALER is None:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        models_dir = os.path.join(current_dir, "models")
        model_path = os.path.join(models_dir, "donor_ranker.pkl")
        scaler_path = os.path.join(models_dir, "scaler.pkl")

        if os.path.exists(model_path) and os.path.exists(scaler_path):
            _MODEL = joblib.load(model_path)
            _SCALER = joblib.load(scaler_path)
        else:
            _MODEL = None
            _SCALER = None
    return _MODEL, _SCALER


def check_compatibility(recipient_blood, donor_blood):
    recipient = (recipient_blood or "").strip().upper()
    donor = (donor_blood or "").strip().upper()

    if not recipient or not donor:
        return False, 0.0, "Blood group undetermined"

    allowed = COMPATIBILITY_MAP.get(recipient, [recipient])
    if donor in allowed:
        if donor == recipient:
            return True, 1.00, f"Exact ABO/Rh match ({donor})"
        elif donor == 'O-':
            return True, 0.95, "Universal Red Cell donor (O-) clinically compatible"
        else:
            return True, 0.88, f"Clinically compatible ({donor} donor for {recipient} recipient)"
    else:
        return False, 0.00, f"Incompatible blood group ({donor} cannot be given to {recipient})"


def calculate_days_since_donation(last_donated_str):
    if not last_donated_str or last_donated_str == '0000-00-00':
        return 180  # Cleared/first-time donor default
    try:
        dt = datetime.strptime(str(last_donated_str).strip()[:10], "%Y-%m-%d")
        delta = (datetime.now() - dt).days
        return max(0, delta)
    except Exception:
        return 180


def rank_donors(recipient_blood, donors, urgency="Normal"):
    """
    Rank a list of donor candidate dicts.
    Returns donors sorted with recommendation_score and recommendation_reasons.
    """
    model, scaler = load_model_and_scaler()
    urgency_val = URGENCY_MAP.get(urgency, 1)

    ranked_results = []

    for d in donors:
        donor_blood = d.get("blood_group", "")
        is_compat, compat_score, compat_reason = check_compatibility(recipient_blood, donor_blood)

        # STRICT MEDICAL SAFETY: Incompatible blood groups receive 0 score and clear warning
        if not is_compat:
            ranked_results.append({
                **d,
                "recommendation_score": 0,
                "is_compatible": False,
                "reasons": [compat_reason, "Medical safety restraint: ABO/Rh incompatibility"],
                "badge": "Incompatible",
                "score_label": "0%"
            })
            continue

        # Extract features
        distance = d.get("distance_km")
        distance_val = float(distance) if (distance is not None and distance != "") else 12.0
        is_avail = 1 if (d.get("available") in (1, "1", True, "true")) else 0
        days_since = calculate_days_since_donation(d.get("last_donated"))
        prev_donations = int(d.get("total_donations") or 0)
        resp_rate = float(d.get("response_rate") or 85.0)

        # Feature vector: [compat_score, distance_km, is_available, days_since_donation, prev_donations, response_rate, urgency]
        feature_vec = np.array([[
            compat_score,
            distance_val,
            is_avail,
            days_since,
            prev_donations,
            resp_rate,
            urgency_val
        ]])

        if model is not None and scaler is not None:
            # Model inference
            try:
                scaled = scaler.transform(feature_vec)
                prob = float(model.predict_proba(scaled)[0, 1])
                # Calibrate score to integer percentage [30% to 98%]
                # Fine-tune based on exact distance and experience
                base_pct = prob * 85.0
                if is_avail:
                    base_pct += 10.0
                if distance is not None:
                    dist_bonus = max(0.0, 5.0 - (float(distance) * 0.4))
                    base_pct += dist_bonus
                if days_since >= 90:
                    base_pct += 3.0
                if prev_donations >= 3:
                    base_pct += 2.0

                score = int(np.clip(round(base_pct), 20, 98))
            except Exception as e:
                # Rule-based fallback if inference fails
                score = rule_based_score(compat_score, distance, is_avail, days_since, prev_donations, resp_rate, urgency_val)
        else:
            # Rule-based ranking fallback
            score = rule_based_score(compat_score, distance, is_avail, days_since, prev_donations, resp_rate, urgency_val)

        # Generate human-readable explanation reasons
        reasons = []
        reasons.append(compat_reason)

        if is_avail:
            reasons.append("Currently available for donation")
        else:
            reasons.append("Marked unavailable on profile")

        if distance is not None:
            dist_float = float(distance)
            if dist_float <= 3.0:
                reasons.append(f"Nearby location ({dist_float} km)")
            elif dist_float <= 10.0:
                reasons.append(f"Accessible proximity ({dist_float} km)")
            else:
                reasons.append(f"Location distance: {dist_float} km")
        else:
            reasons.append(f"Location match: {d.get('location', '')}, {d.get('district', '')}")

        if days_since >= 90:
            reasons.append(f"Eligible cooldown: {days_since} days since last donation")
        else:
            reasons.append(f"Recent donation ({days_since} days ago; standard cooldown is 90 days)")

        if prev_donations >= 3:
            reasons.append(f"Experienced voluntary donor ({prev_donations} donations)")

        # Determine visual badge
        badge = "Recommended"
        if score >= 90:
            badge = "Highly Recommended"
        elif score >= 80:
            badge = "Recommended"
        elif not is_avail:
            badge = "Unavailable"
        else:
            badge = "Potential Match"

        ranked_results.append({
            **d,
            "recommendation_score": score,
            "is_compatible": True,
            "reasons": reasons,
            "badge": badge,
            "score_label": f"{score}%"
        })

    # Sort candidates descending by recommendation score
    ranked_results.sort(key=lambda x: x["recommendation_score"], reverse=True)
    return ranked_results


def rule_based_score(compat_score, distance, is_avail, days_since, prev_donations, resp_rate, urgency_val):
    """Deterministic fallback ranking formula when ML model file is offline"""
    score = compat_score * 35.0
    if is_avail:
        score += 30.0
    else:
        score += 5.0

    if distance is not None:
        d = float(distance)
        dist_score = max(0.0, 20.0 - (d * 0.8))
        score += dist_score
    else:
        score += 10.0  # neutral distance

    if days_since >= 90:
        score += 10.0
    else:
        score += 2.0

    score += min(5.0, prev_donations * 1.0)
    score += (resp_rate / 100.0) * 5.0
    return int(np.clip(round(score), 15, 98))


if __name__ == "__main__":
    # Test CLI invocation with sample donors
    if len(sys.argv) > 1:
        try:
            payload = json.loads(sys.argv[1])
            rec_blood = payload.get("recipient_blood", "B+")
            donors = payload.get("donors", [])
            urg = payload.get("urgency", "Normal")
            ranked = rank_donors(rec_blood, donors, urg)
            print(json.dumps(ranked, indent=2))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
    else:
        # Self-test
        sample_donors = [
            {"id": 1, "name": "Donor A", "blood_group": "B+", "available": 1, "distance_km": 1.8, "last_donated": "2024-05-10", "total_donations": 4, "response_rate": 95},
            {"id": 2, "name": "Donor B", "blood_group": "B+", "available": 1, "distance_km": 8.5, "last_donated": "2024-06-01", "total_donations": 2, "response_rate": 88},
            {"id": 3, "name": "Donor C", "blood_group": "O+", "available": 1, "distance_km": 18.0, "last_donated": "2024-04-12", "total_donations": 5, "response_rate": 92},
            {"id": 4, "name": "Donor D", "blood_group": "A+", "available": 1, "distance_km": 1.2, "last_donated": "2024-05-15", "total_donations": 3, "response_rate": 90}
        ]
        results = rank_donors("B+", sample_donors, "Urgent")
        for r in results:
            print(f"{r['name']}: Score {r['recommendation_score']}% ({r['badge']})")
            print("  Reasons:", " | ".join(r["reasons"]))
