from flask import Flask, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)  # React에서 API 호출 가능하게

# 이벤트 데이터 불러오기
with open("events.json", "r", encoding="utf-8") as f:
    events = json.load(f)

@app.route("/api/events", methods=["GET"])
def get_events():
    return jsonify(events)

if __name__ == "__main__":
    app.run(debug=True)
