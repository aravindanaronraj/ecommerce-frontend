import axios from "axios";

const api = axios.create({
  baseURL: "https://ecommerce-backend-6aai.onrender.com",
});

export default api;