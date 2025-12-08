from flask import request, Flask, jsonify
from flask_cors import CORS
import json
import os
import uuid

app = Flask(__name__)
CORS(app)  # React에서 API 호출 가능하게

# Load events from JSON file located in the same directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "events.json")

def load_data():
    if not os.path.exists(DATA_FILE):
        return {}
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def migrate_ids(data):
    """Ensure all events have an ID and completed status."""
    changed = False
    for year in data:
        for month in data[year]:
            for event in data[year][month]:
                if "id" not in event:
                    event["id"] = str(uuid.uuid4())
                    changed = True
                if "completed" not in event:
                    event["completed"] = False
                    changed = True
    if changed:
        save_data(data)
    return data

@app.route("/api/events", methods=["GET"])
def get_events():
    data = load_data()
    data = migrate_ids(data) # Ensure integrity on load
    return jsonify(data)

@app.route('/api/post_data', methods=['POST'])
def receive_data():
    data = request.json
    if data is None:
        return jsonify({"error": "No JSON data received"}), 400

    date = [data.get('year', 2025), data.get('month', 1), data.get('day', 1)]
    title = data.get('title', '')
    description = data.get('description', '')
    title = title.strip()
    description = description.strip()

    if not title or not description:
        return jsonify({"error": "제목과 내용은 필수 입력 항목입니다."}), 400
    
    existing_data = load_data()

    year = str(date[0])
    month = str(date[1])
    day = date[2]

    if year not in existing_data:
        existing_data[year] = {}
    
    if month not in existing_data[year]:
        existing_data[year][month] = []
    
    new_event = {
        "id": str(uuid.uuid4()),
        "day": day,
        "title": title,
        "description": description,
        "completed": False
    }
    
    existing_data[year][month].append(new_event)
    save_data(existing_data)
    
    return jsonify({
        "status": "success",
        "message": "데이터를 성공적으로 받았습니다.",
        "received_data": new_event
    }), 200

@app.route('/api/events/<event_id>', methods=['DELETE'])
def delete_event(event_id):
    data = load_data()
    deleted = False
    
    for year in data:
        for month in data[year]:
            events = data[year][month]
            for i, event in enumerate(events):
                if event.get("id") == event_id:
                    del events[i]
                    deleted = True
                    break
            if deleted: break
        if deleted: break
            
    if deleted:
        save_data(data)
        return jsonify({"status": "success", "message": "Deleted"}), 200
    else:
        return jsonify({"error": "Event not found"}), 404

@app.route('/api/events/<event_id>/complete', methods=['PATCH'])
def toggle_complete(event_id):
    data = load_data()
    found = False
    new_status = False

    for year in data:
        for month in data[year]:
            for event in data[year][month]:
                if event.get("id") == event_id:
                    event["completed"] = not event.get("completed", False)
                    new_status = event["completed"]
                    found = True
                    break
            if found: break
        if found: break
    
    if found:
        save_data(data)
        return jsonify({"status": "success", "completed": new_status}), 200
    else:
        return jsonify({"error": "Event not found"}), 404

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
