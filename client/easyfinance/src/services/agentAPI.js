// services/agentAPI.js

import axios from "axios";

// Create axios instance with base URL for API
const API = axios.create({
  baseURL:"http://localhost:8000/api/v1",
  withCredentials: true, // Important for cookies/sessions
});

// Get all clients for the agent
export const getAllAgentClients = async () => {
  try {
    const response = await API.get("/agent/allclients", {});
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get details for a specific client
export const getClientDetails = async (clientId) => {
  try {
    const response = await API.get(`/agent/clients/${clientId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create a new client
export const addClient = (data) => API.post("/admin/addclient", data);

// Collect EMI from a client for a specific loan
export const collectEmi = async (clientId, loanId, emiData) => {
  try {
    const response = await API.post(
      `/agent/clients/${clientId}/loans/${loanId}/emi`,
      emiData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create a new loan for a client
export const createLoan = async (clientId, loanData) => {
  try {
    const response = await API.post(
      `/agent/clients/${clientId}/loans`,
      loanData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get agent profile
export const getAgentProfile = async () => {
  try {
    const response = await API.get("/agent/profile");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update agent profile
export const updateAgentProfile = async (profileData) => {
  try {
    const response = await API.patch("/agent/profile", profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Agent login
export const loginAgent = async (credentials) => {
  try {
    const response = await API.post("/auth/login-agent", credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Agent logout
export const logoutAgent = async () => {
  try {
    const response = await API.post("/agent/logout");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get dashboard statistics
export const getAgentDashboardAnalyticsData = async () => {
  try {
    const response = await API.get("/agent/dashboard/stats");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Request for error interceptor (can be used on the actual implementation)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle session timeout or unauthorized access
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      // Redirect to login or show authentication error
      console.error("Authentication error:", error.response.data);
      // Optionally redirect to login page
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
