import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (username: string, password: string) =>
    api.post("/auth/login", new URLSearchParams({ username, password }), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }),
  register: (data: { username: string; email: string; password: string; interests: string[] }) =>
    api.post("/auth/register", data),
  me: () => api.get("/auth/me"),
};

// Curiosities
export const curiositiesAPI = {
  getDaily: () => api.get("/curiosities/daily"),
  getHistory: (skip = 0, limit = 30) => api.get(`/curiosities/history?skip=${skip}&limit=${limit}`),
  search: (query: string) => api.get(`/curiosities/search?q=${query}`),
  like: (id: number) => api.post(`/curiosities/${id}/like`),
  unlike: (id: number) => api.delete(`/curiosities/${id}/like`),
  getComments: (id: number) => api.get(`/curiosities/${id}/comments`),
  addComment: (id: number, content: string) => api.post(`/curiosities/${id}/comments`, { content }),
};

// Social
export const socialAPI = {
  getFeed: () => api.get("/social/feed"),
  follow: (userId: number) => api.post(`/social/follow/${userId}`),
  unfollow: (userId: number) => api.delete(`/social/follow/${userId}`),
  getFollowers: (userId: number) => api.get(`/social/followers/${userId}`),
  getFollowing: (userId: number) => api.get(`/social/following/${userId}`),
};

// Users
export const usersAPI = {
  getProfile: (userId: number) => api.get(`/users/${userId}`),
  searchUsers: (query: string) => api.get(`/users/search?q=${query}`),
};

export default api;
