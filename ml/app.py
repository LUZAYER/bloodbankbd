#!/usr/bin/env python3
"""
BloodLink - Flask AI & Machine Learning Microservice API
Provides HTTP REST endpoints for natural language search parsing and ML donor ranking.
"""

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, request, jsonify
from nlp_parser import parse_natural_language_query
from ranker import rank_donors, load_model_and_scaler

app = Flask(__name__)

# Warm up ML model
model, scaler = load_model_and_scaler()


@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "name": "BloodLink AI & Machine Learning Microservice",
        "version": "2.0.0",
        "status": "online",
        "endpoints": [
            "/api/health",
            "/api/parse_query",
            "/api/rank"
        ]
    })


@app.route("/api/health", methods=["GET"])
def health():
    m, s = load_model_and_scaler()
    return jsonify({
        "status": "healthy",
        "model_loaded": m is not None,
        "scaler_loaded": s is not None
    })


@app.route("/api/parse_query", methods=["POST", "GET"])
def api_parse_query():
    query_text = ""
    if request.method == "POST":
        data = request.get_json(silent=True) or request.form.to_dict()
        query_text = data.get("query", "")
    else:
        query_text = request.args.get("query", "")

    parsed = parse_natural_language_query(query_text)
    return jsonify({
        "success": True,
        "query": query_text,
        "filters": parsed
    })


@app.route("/api/rank", methods=["POST"])
def api_rank():
    data = request.get_json(silent=True) or {}
    recipient_blood = data.get("recipient_blood", "B+")
    donors = data.get("donors", [])
    urgency = data.get("urgency", "Normal")

    if not isinstance(donors, list):
        return jsonify({"success": False, "error": "donors must be an array"}), 400

    ranked = rank_donors(recipient_blood, donors, urgency)
    return jsonify({
        "success": True,
        "recipient_blood": recipient_blood,
        "urgency": urgency,
        "count": len(ranked),
        "results": ranked
    })


if __name__ == "__main__":
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting BloodLink Flask ML Microservice on http://{host}:{port}...")
    app.run(host=host, port=port, debug=False)
