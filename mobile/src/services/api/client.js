import axios from "axios";
import { getToken } from "../secureStoreService";
import { API_BASE_URL, API_TIMEOUT } from "./config";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    // Get token from secure storage
    const token = await getToken();
    if (token) {
      // If token exists, add it to the Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Any status codes outside the range of 2xx cause this function to trigger
    if (error.response && error.response.status === 401) {
      // If we get a 401 Unauthorized, the token is invalid or expired.
      console.warn(
        "Unauthorized request. Token may be invalid. Triggering logout..."
      );
      // TODO: authService.logout();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
