from flask import Flask, jsonify, request
from flask_cors import CORS
from urllib.parse import unquote
import networkx as nx
import qrcode
import base64
from io import BytesIO
import requests
import supabase
import google.generativeai as genai
import os
from dotenv import load_dotenv
import re

load_dotenv()

app = Flask(__name__)
CORS(app)

G = nx.Graph()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase credentials are missing. Check your environment variables.")

try:
    supabase_client = supabase.create_client(SUPABASE_URL, SUPABASE_KEY)
    stations_response = supabase_client.table("metro_stations").select("name").execute()
    stations = [s["name"] for s in stations_response.data] if stations_response.data else []
except Exception as e:
    print(f"Error fetching stations from Supabase: {e}")
    stations = [] 

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-pro")

stations = {
    ('Miyapur', 'Jntu'): 1.8,
    ('Jntu', 'Kphb Colony'): 1.4,
    ('Kphb Colony', 'Kukatpally'): 1.5,
    ('Kukatpally', 'Balanagar'): 1.4,
    ('Balanagar', 'Moosapet'): 0.7,
    ('Moosapet', 'Bharath Nagar'): 1.0,
    ('Bharath Nagar', 'Erragadda'): 0.9,
    ('Erragadda', 'Esi Hospital'): 1.2,
    ('Esi Hospital', 'Sr Nagar'): 0.7,
    ('Sr Nagar', 'Ameerpet'): 0.7,
    ('Ameerpet', 'Panjagutta'): 1.1,
    ('Panjagutta', 'Irrum Manzil'): 1.0,
    ('Irrum Manzil', 'Khairatabad'): 1.2,
    ('Khairatabad', 'Lakdikapol'): 1.1,
    ('Lakdikapol', 'Assembly'): 1.0,
    ('Assembly', 'Nampally'): 0.6,
    ('Nampally', 'Gandhi Bhavan'): 0.8,
    ('Gandhi Bhavan', 'Osmania Medical College'): 1.0,
    ('Osmania Medical College', 'Mg Bus Station'): 0.6,
    ('Mg Bus Station', 'Malakpet'): 1.0,
    ('Malakpet', 'New Market'): 1.1,
    ('New Market', 'Musarambhag'): 0.9,
    ('Musarambhag', 'Dilsukhnagar'): 1.6,
    ('Dilsukhnagar', 'Chaitanyapuri'): 1.0,
    ('Chaitanyapuri', 'Victoria Memorial'): 1.3,
    ('Victoria Memorial', 'Lb Nagar'): 1.4,
    ('Raidurg', 'Hitec City'): 1.5,
    ('Hitec City', 'Durgam Cheruvu'): 0.8,
    ('Durgam Cheruvu', 'Madhapur'): 1.6,
    ('Madhapur', 'Peddamma Gudi'): 1.2,
    ('Peddamma Gudi', 'Jubilee Hills Check Post'): 0.7,
    ('Jubilee Hills Check Post', 'Road No5 Jubilee Hills'): 1.2,
    ('Road No5 Jubilee Hills', 'Yusufguda'): 0.9,
    ('Yusufguda', 'Madhura Nagar'): 1.3,
    ('Madhura Nagar', 'Ameerpet'): 0.8,
    ('Ameerpet', 'Begumpet'): 1.5,
    ('Begumpet', 'Prakash Nagar'): 1.5,
    ('Prakash Nagar', 'Rasoolpura'): 1.1,
    ('Rasoolpura', 'Paradise'): 1.0,
    ('Paradise', 'Parade Ground'): 1.2,
    ('Parade Ground', 'Secunderabad East'): 1.6,
    ('Secunderabad East', 'Mettuguda'): 1.9,
    ('Mettuguda', 'Tarnaka'): 1.2,
    ('Tarnaka', 'Habsiguda'): 1.6,
    ('Habsiguda', 'Ngri'): 0.9,
    ('Ngri', 'Stadium'): 1.1,
    ('Stadium', 'Uppal'): 1.1,
    ('Uppal', 'Nagole'): 1.1,
    ('Parade Ground', 'Secunderabad West'): 1.3,
    ('Secunderabad West', 'Gandhi Hospital'): 1.3,
    ('Gandhi Hospital', 'Musheerabad'): 0.9,
    ('Musheerabad', 'Rtc X Roads'): 1.2,
    ('Rtc X Roads', 'Chikkadpally'): 0.8,
    ('Chikkadpally', 'Narayanaguda'): 0.9,
    ('Narayanaguda', 'Sulthan Bazaar'): 1.3,
    ('Sulthan Bazaar', 'Mg Bus Station'): 0.7
}


for (start, end), distance in stations.items():
    G.add_edge(start, end, weight=distance)

def dfs_path(graph, start, goal):
    stack = [(start, [start])]
    while stack:
        (vertex, path) = stack.pop()
        for next in set(graph.neighbors(vertex)) - set(path):
            if next == goal:
                yield path + [next]
            else:
                stack.append((next, path + [next]))


def calculate_path_distance(graph, path):
    distance = 0
    for i in range(len(path) - 1):
        distance += graph[path[i]][path[i + 1]]['weight']
    return distance

def calculate_fare(dist):
    if dist <=2 :
        return 10
    elif dist>2 and dist <=4 :
        return 15
    elif dist>4 and dist<=6 :
        return 25
    elif dist>6 and dist<=8:
        return 30
    elif dist>8 and dist<=10:
        return 35
    elif dist>10 and dist<=14:
        return 40
    elif dist>14 and dist<=18:
        return 45
    elif dist>18 and dist<=22:
        return 50
    elif dist>22 and dist<=26:
        return 55
    else:
        return 60

def get_path(paths,start,end) :
    mid = []
    distances = [calculate_path_distance(G, path) for path in paths]
    min_distance_index = distances.index(min(distances))
    min_distance_path = paths[min_distance_index]
    min_distance = distances[min_distance_index]
    min_distance = round(min_distance, 2)
    fare = calculate_fare(min_distance)
    if "Ameerpet" in min_distance_path and start != "Ameerpet" and end != "Ameerpet":
        mid.append("Ameerpet")
    if "Mg Bus Station" in min_distance_path and start != "Mg Bus Station" and end != "Mg Bus Station":
        mid.append("Mg Bus Station")
    if "Parade Ground" in min_distance_path and start != "Parade Ground" and end != "Parade Ground":
        mid.append("Parade Ground")
    
    if len(mid) == 0:
        displayPath = start + " -> " + end
    else:
        displayPath = start + " -> " + " -> ".join(mid) + " -> "  + end
    return jsonify({'path': displayPath, 'distance': min_distance, 'fare': fare})

@app.route('/path/<start>/<end>')
def find_path(start, end):
    start = unquote(start)
    end = unquote(end)
    paths = list(dfs_path(G, start, end))
    if paths:
        return get_path(paths,start,end)
            
    else:
        return jsonify({'error': 'No path found between {} and {}'.format(start, end)})

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

    # **Handle fare queries**
    if stationsBody:
        
        source, destination = stationsBody[0], stationsBody[1]
        source_encoded = unquote(source)
        destination_encoded = unquote(destination)

        paths = list(dfs_path(G, source_encoded, destination_encoded))
        if paths:
            return get_path(paths, source_encoded, destination_encoded)
        else:
            return jsonify({'error': 'No path found between {} and {}'.format(source, destination)})

    # **Handle places near a metro station**
    if location:
        if location in stations:
            gemini_prompt = f"What are some famous places to visit near {location} Metro Station within a 5 km radius in Hyderabad? Provide a short and informative response."
            places_info = generate_gemini_response(gemini_prompt)
            return jsonify({"response": places_info if places_info else "No places found."})
        else:
            return jsonify({"response": "Please specify a valid metro station to find nearby places."})

    # **Handle general queries**
    result = generate_gemini_response(user_query + " If it is not related to the metro, please say that I am not sure about it. I can help you with metro-related queries.")
    
    if "not sure" in result:
        return jsonify({"response": "I am not sure about that. I can help you with metro-related queries."})

    return jsonify({"response": result})

if __name__ == '__main__':
    app.run(debug=True,port=5000)

