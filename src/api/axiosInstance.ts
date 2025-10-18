import axios from "axios";
import { store } from "../redux/store";
import { jwtDecode } from "jwt-decode";
import { clear_auth, update_auth_data } from "../redux/action";

const API_BASE_URL = "https://spot.app.codevicesolution.in/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      const finalToken = token.startsWith("Bearer") ? token : `Bearer ${token}`;
      config.headers.Authorization = finalToken;

      try {
        const decodedUser: any = jwtDecode(finalToken.replace("Bearer ", ""));

        const payload = {
          token: finalToken,
          roles: decodedUser.roles || [],
          email: decodedUser.sub,
          expiryTime: decodedUser.exp
            ? new Date(decodedUser.exp * 1000).toISOString()
            : "",
            name : decodedUser.name,
        };
          store.dispatch(update_auth_data(payload));

        // ✅ Dispatch to Redux (only if store is empty to avoid overwriting on every request)
      
      } catch (err) {
        console.error("JWT decode error:", err);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear Redux
      store.dispatch(clear_auth());

      // Clear localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");

      // Redirect to login
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
