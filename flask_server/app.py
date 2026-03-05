from flask import request, Flask, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
import uuid

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(BASE_DIR, "../dist")

app = Flask(__name__, static_folder=DIST_DIR, static_url_path="")
CORS(app)

# Load events from JSON file located in the same directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "events.json")
SUGGESTIONS_FILE = os.path.join(BASE_DIR, "suggestions.json")

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

def load_suggestions():
    """Load suggestions from JSON file."""
    if not os.path.exists(SUGGESTIONS_FILE):
        return []
    try:
        with open(SUGGESTIONS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def save_suggestions(suggestions):
    """Save suggestions to JSON file."""
    with open(SUGGESTIONS_FILE, "w", encoding="utf-8") as f:
        json.dump(suggestions, f, ensure_ascii=False, indent=2)

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

@app.route('/api/events/<event_id>', methods=['PUT'])
def update_event(event_id):
    data = request.json
    if not data:
        return jsonify({"error": "No JSON data received"}), 400

    existing_data = load_data()
    found_event = None
    original_location = None # (year, month, index)

    # Find the event
    for year in existing_data:
        for month in existing_data[year]:
            events = existing_data[year][month]
            for i, event in enumerate(events):
                if event.get("id") == event_id:
                    found_event = event
                    original_location = (year, month, i)
                    break
            if found_event: break
        if found_event: break
    
    if not found_event:
        return jsonify({"error": "Event not found"}), 404

    # New data
    new_year = str(data.get('year', original_location[0]))
    new_month = str(data.get('month', original_location[1]))
    new_day = data.get('day', found_event['day'])
    new_title = data.get('title', found_event['title']).strip()
    new_desc = data.get('description', found_event['description']).strip()

    if not new_title or not new_desc:
        return jsonify({"error": "Title and description are required"}), 400

    # If date changed, we might need to move the event
    if new_year != original_location[0] or new_month != original_location[1]:
        # Remove from old location
        old_year, old_month, old_idx = original_location
        del existing_data[old_year][old_month][old_idx]
        
        # Ensure new location exists
        if new_year not in existing_data:
            existing_data[new_year] = {}
        if new_month not in existing_data[new_year]:
            existing_data[new_year][new_month] = []
        
        # Add to new location with updated info
        updated_event = {
            "id": event_id,
            "day": new_day,
            "title": new_title,
            "description": new_desc,
            "completed": found_event.get("completed", False)
        }
        existing_data[new_year][new_month].append(updated_event)
    else:
        # Same month/year, just update fields
        found_event['day'] = new_day
        found_event['title'] = new_title
        found_event['description'] = new_desc
        # We don't need to move it, reference is already in the list
    
    save_data(existing_data)
    return jsonify({"status": "success", "message": "Updated"}), 200

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

@app.route("/api/suggestions", methods=["POST"])
def post_suggestion():
    """Save user suggestion."""
    data = request.json
    if data is None:
        return jsonify({"error": "No JSON data received"}), 400

    message = data.get("message", "").strip()
    
    if not message:
        return jsonify({"error": "건의 메시지는 필수 입력 항목입니다."}), 400
    
    suggestions = load_suggestions()
    
    new_suggestion = {
        "id": str(uuid.uuid4()),
        "message": message,
        "timestamp": str(__import__('datetime').datetime.now())
    }
    
    suggestions.append(new_suggestion)
    save_suggestions(suggestions)
    
    return jsonify({
        "status": "success",
        "message": "건의해주셔서 감사합니다!"
    }), 200

@app.route("/api/suggestions", methods=["GET"])
def get_suggestions():
    """Get all suggestions."""
    suggestions = load_suggestions()
    return jsonify(suggestions)

@app.route("/")
def serve():
    return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
