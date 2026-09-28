import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Access Token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expiration & Automatic Refresh
api.interceptors.response.use(
  (response) => {
    // Return data object directly from ApiResponse wrapper
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and request has not already been retried
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/refresh-token')
    ) {
      originalRequest._retry = true;

      try {
        // Call refresh token endpoint (sends httpOnly cookie or stored refreshToken)
        const storedRefreshToken = localStorage.getItem('refreshToken');
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh-token`,
          { refreshToken: storedRefreshToken },
          { withCredentials: true }
        );

        const newAccessToken =
          refreshResponse.data?.data?.accessToken ||
          refreshResponse.data?.data?.token ||
          refreshResponse.data?.accessToken;

        if (newAccessToken) {
          localStorage.setItem('accessToken', newAccessToken);
          localStorage.setItem('token', newAccessToken);

          // Update header and retry original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Session expired or invalid refresh token - clear user state
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        // Only redirect if not already on login or public routes
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError.response?.data || refreshError);
      }
    }

    // Standardize error message
    const customError = error.response?.data || {
      message: error.message || 'Something went wrong',
      statusCode: error.response?.status || 500,
    };

    return Promise.reject(customError);
  }
);

export default api;
