import axios from "axios";

// Create an axios instance with baseURL
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // ✅ This sends cookies with every request
});

// Function to get the token from localStorage (or sessionStorage if preferred)

// ✅ Delete client by ID
export const deleteClient = (clientId) =>
  
  API.delete(`/admin/deleteclient/${clientId}`);


  // ✅ Logout admin
export const logoutAdmin = () => API.post("/admin/logout");

// Admin APIs
export const registerAdmin = (data) => API.post("/admin/register", data);



export const requestPasswordReset = async (data) => {
  return await axios.post(`${API}/auth/request-password-reset`, data);
};

export const verifyOTP = async (data) => {
  return await axios.post(`${API}/auth/verify-otp`, data);
};

export const resetPassword = async (data) => {
  return await axios.post(`${API}/auth/reset-password`, data);
};




// import API from 'your-api-instance'; // Ajust to your API setup






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
export const registerAgent = (formData) =>
  API.post("/admin/addagent", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const registerClient = (data) => API.post("/admin/addclient", data);

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
export const getClientDetailsById = async (clientId) => {
  try {
    const response = await API.get(`/admin/getClientdata/${clientId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching client detail:", error);
    throw error;
  }
};

export const loanDetails = async (clientId) => {
  try {
    const response = await API.get(`/admin/viewclientloan/${clientId}/loans`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching loan detail:", error);
    throw error;
  }
};


//add loan 
export const addLoanToClient = async (clientId, loans) => {
  return await API.post(`/admin/addloantoclient/${clientId}`, { loans });
}
// ✅ Delete agent by ID
export const deleteAgent = (id) => API.delete(`/admin/deleteagent/${id}`);


//loan details 
export const getLoanDetailsById = async (loanId) => {
  try {
    const response = await API.get(`/admin/getloandetails/${loanId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching loan details:", error);
    throw error;
  }
};

//collect emi
export const collectEMI = (clientId, loanId, data, isAgent) =>
  API.post(`${isAgent ? '/agent' : '/admin'}/collectemi/${clientId}/${loanId}`, data);
// collection history 
export const getEmiCollectionHistory = async (clientId, loanId) => {
  try {
    const response = await API.get(`/admin/viewEmiCollectionHistory/${clientId}/${loanId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching EMI collection history:", error);
    throw error;
  }
};
export const getAgentEmiCollection = async (agentId) => {
  try {
    const response = await API.get(`/admin/getEmiCollection/${agentId}`);
    console.log("response", response);
    
    return response.data;
  } catch (error) {
    console.error("Error fetching agent EMI collection history:", error);
    throw error;
  }
};



export const updateLoanStatus = async (clientId, loanId, data) =>
  API.post(`/admin/updateLoanStatus/${clientId}/${loanId}/status`, data);




export const getTodayCollections = async () => {
  try {
    const response = await API.get("/admin/today-collections");
    console.log("Today's collections response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching today's collections:", error);
    throw error;
  }
};



export const deleteLoan = async (clientId, loanId) => {
  try {
    const response = await API.delete(`/admin/deleteLoan/${clientId}/${loanId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting loan:", error);
    throw error;
  }
};



export const fetchAllDefaultedClients = async () => {
  try {
    const response = await API.get(`/admin/clients/default-emis`);
    return response.data.data; // ✅ this accesses the nested defaultedClientsMap
  } catch (error) {
    console.error("Error fetching default EMI:", error);
    throw error;
  }
};


export const fetchDefaultemis = async (clientId) => {
  try {
    const response = await API.get(`/admin/clients/${clientId}/default-emis`);
    return response.data.data; // ✅ access 'data' from ApiResponse
  } catch (error) {
    console.error("Error fetching default EMI:", error);
    throw error;
  }
};


export const payDefaultEmi = async (clientId, loanId, data) =>
  API.post(`/admin/clients/${clientId}/loans/${loanId}/pay-default-emi`, data);