import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;

    if (response && response.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }

    const errorMessage =
      response && response.data.message
        ? response.data.message
        : "Something went wrong. Please try again.";

    toast.error(errorMessage);

    return Promise.reject(error);
  }
);

export default api;
