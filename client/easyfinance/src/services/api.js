import axios from "axios";

// Create an axios instance with baseURL
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // ✅ This sends cookies with every request
});


// Function to get the token from localStorage (or sessionStorage if preferred)


// Admin APIs
export const registerAdmin = (data) => API.post("/admin/register", data);

// Login handling both email and username
export const loginAdmin = (data) => {
  // console.log('login data', data);
  
  const isEmail = data.emailOrUsername.includes("@");

  const payload = {
    password: data.password,
    ...(isEmail
      ? { email: data.emailOrUsername }
      : { username: data.emailOrUsername }),
  };

  return API.post("/admin/login", payload);
};

// Agent APIs
export const registerAgent = (data) => API.post("/admin/addagent", data);
export const registerClient = async (clientData) => {
  try {
    const formData = new FormData();

    formData.append('clientName', clientData.clientName);
    formData.append('clientPhone', clientData.clientPhone);
    formData.append('clientAddress', clientData.clientAddress);
    formData.append('loans', JSON.stringify(clientData.loans));

    if (clientData.photo) {
      formData.append('file', clientData.photo);
    }

    const response = await axios.post('/api/v1/clients/add', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error("Add Client Error:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Get all agents with JWT token in the Authorization header
export const getAllAgents = async () => {
  try {
    const response = await API.get("/admin/allagents", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching agents:", error);
    throw error;
  }
};
// ✅ Get all agents with JWT token in the Authorization header
export const getAdminDashboardAnalyticsData = async () => {
  try {
    const response = await API.get("/admin/dashboard", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching data of dashboard:", error);
    throw error;
  }
};
export const getAllClients = async () => {
  try {
    const response = await API.get("/admin/allclients", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw error;
  }
};




// ✅ Delete agent by ID
export const deleteAgent = (id) => API.delete(`/admin/deleteagent/${id}`);
