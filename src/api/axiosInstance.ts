import axios from "axios";
import { store } from "../redux/store";
import { jwtDecode } from "jwt-decode";
import { clear_auth, update_auth_data } from "../redux/action";

const API_BASE_URL = "https://spot.app.codevicesolution.in/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

// ✅ Helper: Decode token expiry
const getTokenExpiryTime = (token: string) => {
  try {
    const decoded: any = jwtDecode(token);
    return decoded?.exp ? decoded.exp * 1000 : 0;
  } catch {
    return 0;
  }
};

// ✅ Helper: Check if token will expire soon (within 2 mins)
const willExpireSoon = (token: string) => {
  const expiryTime = getTokenExpiryTime(token);
  if (!expiryTime) return false;
  const currentTime = Date.now();
  const remaining = expiryTime - currentTime;
  return remaining < 2 * 60 * 1000; // less than 2 minutes
};

// ✅ Refresh token API call
const refreshAccessToken = async () => {
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
  refreshPromise = axios
    .post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
    .then((res) => {
      console.log("🔄 Refresh token response:", res.data);

      const newToken = res?.data?.accessToken;

      if (newToken) {
        localStorage.setItem("accessToken", newToken);

        const decodedUser: any = jwtDecode(newToken);
        const payload = {
          token: `Bearer ${newToken}`,
          roles: decodedUser.roles || [],
          email: decodedUser.sub,
          expiryTime: decodedUser.exp
            ? new Date(decodedUser.exp * 1000).toISOString()
            : "",
          name: decodedUser.name,
        };
        store.dispatch(update_auth_data(payload));
      }

      return res;
    })
    .catch((err) => {
      console.error("❌ Token refresh failed:", err);
      store.dispatch(clear_auth());
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");
      window.location.href = "/";
      throw err;
    })
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

  return refreshPromise;
};

// ✅ Request Interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem("accessToken");

    if (token) {
      const rawToken = token.startsWith("Bearer ") ? token.replace("Bearer ", "") : token;

      // 🔍 Check if token is about to expire
      if (willExpireSoon(rawToken)) {
        console.log("⚠️ Access token expiring soon, refreshing...");
        try {
          const res = await refreshAccessToken();
          token = res?.data?.accessToken;
        } catch {
          console.log("Failed to refresh token before expiry.");
        }
      }

      const finalToken = token?.startsWith("Bearer") ? token : `Bearer ${token}`;
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
          name: decodedUser.name,
        };
        store.dispatch(update_auth_data(payload));
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
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      const originalRequest = error.config;
      originalRequest._retry = true;

      try {
        const res = await refreshAccessToken();
        const newToken = res?.data?.accessToken;
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.log("Session expired, redirecting to login.");
        store.dispatch(clear_auth());
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userData");
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
