#!/usr/bin/env python3
"""
BloodLink - Retraining Process Script (Feature 2)
Allows administrators or automated pipelines to retrain the Random Forest model
with updated sample sizes, new parameters, or ingested donor response histories.
"""

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from train_model import train_and_save_model
from evaluate import evaluate_model


def run_retraining(output_dir=None):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    target_dir = output_dir or os.path.join(current_dir, "models")
    print("=" * 60)
    print("Starting BloodLink Model Retraining Pipeline...")
    print("=" * 60)
    meta = train_and_save_model(target_dir)
    print("\nRunning post-retraining evaluation...")
    evaluate_model()
    print("\nRetraining complete. New model is active.")
    return meta


if __name__ == "__main__":
    run_retraining()
