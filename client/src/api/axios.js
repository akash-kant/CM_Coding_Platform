import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api' // The base URL for all backend requests
});

export default api;