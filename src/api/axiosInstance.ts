import axios from "axios";
 const  NEXT_PUBLIC_API_BASEURL= "https://spot.app.codevicesolution.in/api"

 
const instance = axios.create({
  baseURL: NEXT_PUBLIC_API_BASEURL, // Changed to Next.js public env variable
  withCredentials: true, // important for cookie-based auth
});

// Response interceptor to handle refresh
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASEURL}/auth/refresh`, // Changed to Next.js public env variable
          {},
          { withCredentials: true }
        );
        const newToken = res.headers["authorization"]?.split(" ")[1];
        if (newToken) {
          instance.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${newToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          return instance(originalRequest);
        }
      } catch (refreshError) {
        // Redirect to login if refresh fails
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
