import axios from "axios";

const flask = axios.create({
    baseURL: import.meta.env.VITE_FLASK_URL || 'http://localhost:5000',
});

export default flask;
