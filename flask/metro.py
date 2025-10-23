from flask import Flask, jsonify, request
from flask_cors import CORS
from urllib.parse import unquote
import networkx as nx
import qrcode
import base64
from io import BytesIO
import google.generativeai as genai
import os
from dotenv import load_dotenv
import re
from pymongo import MongoClient
from networkx.exception import NetworkXNoPath, NodeNotFound

load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB
client = MongoClient(os.getenv("MONGODB_URI"))
db = client["test"]
stations = db["stations"]

# Graph
G = nx.Graph()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

stations_data = list(stations.find({}, {'_id': 0}))
if not stations_data:
    print("No station data found in the database.")
else:
    for station in stations_data:
        try:
            start = station["start"]
            end = station["end"]
            dist = float(station["distance"])
            G.add_edge(start, end, weight=dist)
        except KeyError:
            continue

stations_list = list(G.nodes())

def calculate_path_distance(graph, path):
    """Sum weights along a path list of nodes."""
    distance = 0.0
    for i in range(len(path) - 1):
        distance += graph[path[i]][path[i + 1]]['weight']
    return distance

def calculate_fare(dist):
    if dist <= 2:
        return 12
    elif dist <= 4:
        return 18
    elif dist <= 6:
        return 30
    elif dist <= 9:
        return 40
    elif dist <= 12:
        return 50
    elif dist <= 15:
        return 55
    elif dist <= 18:
        return 60
    elif dist <= 21:
        return 66
    elif dist <= 24:
        return 70
    else:
        return 75

def get_path_from_nodes(path):
    """Construct display path, distance and fare from a node list."""
    dist = calculate_path_distance(G, path)
    dist = round(dist, 2)
    fare = calculate_fare(dist)
    mid_stations = {"Ameerpet", "Mg Bus Station", "Parade Ground"}
    mid = [station for station in path if station in mid_stations and station != path[0] and station != path[-1]]

    if len(mid) == 0:
        displayPath = path[0] + " -> " + path[-1]
    else:
        displayPath = path[0] + " -> " + " -> ".join(mid) + " -> " + path[-1]

    return jsonify({'path': displayPath, 'distance': dist, 'fare': fare})

# ----------------- Routes -----------------
@app.route('/path/<start>/<end>')
def find_path(start, end):
    start = unquote(start)
    end = unquote(end)
    try:

        shortest_path = nx.dijkstra_path(G, source=start, target=end, weight='weight')
        return get_path_from_nodes(shortest_path)
    except NodeNotFound:
        return jsonify({'error': f'One or both stations not found: {start}, {end}'}), 404
    except NetworkXNoPath:
        return jsonify({'error': f'No path found between {start} and {end}'}), 404

@app.route('/stations')
def get_stations():
    return jsonify({'stations': stations_list})

@app.route('/qrcode/<type>')
def generate_qr_code(type):
    if type == 'ticket':
        start = request.args.get('start')
        end = request.args.get('end')
        data = "Booking Confirmed. Your journey is from {} to {}. Have a safe journey ahead.".format(start, end)
    elif type == 'gpay':
        data = "This is a GPay QR code for development purposes."
    elif type == 'metropass':
        name = request.args.get('name')
        email = request.args.get('email')
        data = "Name: {}\nEmail: {}\nPass Type: Metro Pass\nPass Validity: 3 months. This is a Metro Pass for development purposes".format(name, email)
    else:
        return jsonify({'error': 'Invalid QR code type'})
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    buffer = BytesIO()
    img.save(buffer)
    buffer.seek(0)

    img_str = base64.b64encode(buffer.getvalue()).decode()

    return jsonify({'qrcode': img_str})

def clean_response(text):
    text = re.sub(r"\*+", "", text)
    text = re.sub(r"_+", "", text) 
    text = re.sub(r"\n+", " ", text) 
    return text.strip()

def generate_gemini_response(prompt):
    response = model.generate_content(prompt)
    if response and hasattr(response, "text"):
        return clean_response(response.text)
    return "No response generated."

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_query = data.get("query", "")
    location = data.get("location", "")
    stationsBody = data.get("stations", "")

    if stationsBody:
        source, destination = stationsBody[0], stationsBody[1]
        source_encoded = unquote(source)
        destination_encoded = unquote(destination)
        try:
            shortest_path = nx.dijkstra_path(G, source=source_encoded, target=destination_encoded, weight='weight')
            return get_path_from_nodes(shortest_path)
        except NodeNotFound:
            return jsonify({'error': f'One or both stations not found: {source_encoded}, {destination_encoded}'}), 404
        except NetworkXNoPath:
            return jsonify({'error': f'No path found between {source_encoded} and {destination_encoded}'}), 404

    if location:
        gemini_prompt = f"What are some famous places to visit near {location} Metro Station or area within a 5 km radius in Hyderabad? Provide a short and informative response."
        places_info = generate_gemini_response(gemini_prompt)
        return jsonify({"response": places_info if places_info else "No places found."})
    
    result = generate_gemini_response(user_query + ". Only answer if it is related to the metro rail. If it is not related to the metro, please reply as I am not sure about it. I can help you with metro-related queries.")
    
    if "not sure" in result:
        return jsonify({"response": "I am not sure about that. I can help you with metro-related queries."})

    return jsonify({"response": result})

@app.route('/')
def index():
    return jsonify({"message" : "Welcome to the Hyderabad Metro API."})

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)
