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
  me: () => api.get("/users/me"),
};

// Curiosities
export const curiositiesAPI = {
  getDaily: () => api.get("/feed/daily"),
  getHistory: (skip = 0, limit = 30) => api.get(`/curiosities/history/me?skip=${skip}&limit=${limit}`),
  getCuriosity: (id: number) => api.get(`/curiosities/${id}`),
  search: (query: string) => api.get(`/curiosities/search?q=${query}`),
  like: (id: number) => api.post(`/curiosities/${id}/like`),
  unlike: (id: number) => api.delete(`/curiosities/${id}/like`),
  getComments: (id: number) => api.get(`/curiosities/${id}/comments`),
  addComment: (id: number, content: string) => api.post(`/curiosities/${id}/comments`, { text: content }),
};

// Social
export const socialAPI = {
  getFeed: () => api.get("/feed/social"),
  follow: (userName: string) => api.post(`/users/${userName}/follow`),
  unfollow: (userId: number) => api.delete(`/social/follow/${userId}`),
  getFollowers: (userId: number) => api.get(`/social/followers/${userId}`),
  getFollowing: (userId: number) => api.get(`/social/following/${userId}`),
};

// Users
export const usersAPI = {
  getProfileByUsername: (userName: string) => api.get(`/users/${userName}`),
  searchUsers: (query: string) => api.get(`/users/search?q=${query}`),
};

export default api;
