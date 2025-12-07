from flask import Flask, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)  # React에서 API 호출 가능하게

# Load events from JSON file located in the same directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "events.json")

@app.route("/api/events", methods=["GET"])
def get_events():
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            events = json.load(f)
        return jsonify(events)
    except FileNotFoundError:
        print(f"Error: File not found at {DATA_FILE}")
        return jsonify({})
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON format"}), 500

if __name__ == "__main__":
    app.run(debug=True)
    