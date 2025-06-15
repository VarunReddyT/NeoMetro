import axios from 'axios';

const backend = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000',
})

export default backend;