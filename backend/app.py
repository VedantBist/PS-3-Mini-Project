import os

from flask import Flask, jsonify, request
from flask_cors import CORS

from analyzer import analyze_csv

app = Flask(__name__)
CORS(app)


@app.get("/health")
def health_check():
    return jsonify({"status": "ok"})


@app.post("/analyze")
def analyze_dataset():
    if "file" not in request.files:
        return jsonify({"error": "Please upload a CSV file using the 'file' field."}), 400

    csv_file = request.files["file"]
    if not csv_file.filename.lower().endswith(".csv"):
        return jsonify({"error": "Only CSV files are supported."}), 400

    try:
        result = analyze_csv(csv_file.read())
        return jsonify(result)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": f"Unexpected server error: {exc}"}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)
