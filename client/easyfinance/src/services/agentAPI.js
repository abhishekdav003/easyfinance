
import axios from "axios";

// Create axios instance with base URL for API
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // ✅ This sends cookies with every request
});



// Login Agent
export const loginAgent = (data) => {
  const isEmail = data.emailOrUsername.includes("@");

  const payload = {
    password: data.password,
    ...(isEmail
      ? { email: data.emailOrUsername }
      : { agentusername: data.emailOrUsername }), // Use 'agentusername' for consistency with your backend
  };

  return API.post("/agent/login", payload)
    .then((response) => {
      // Handle successful login (status 200)
      const { agent, accessToken, refreshToken } = response.data.data;

      // Optionally, you can store these tokens in localStorage or state if you need them client-side:
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Set the agent data in your app state (assuming you are using Redux or Context API)
      // dispatch({ type: 'SET_AGENT', payload: agent }); // Example if using Redux

      console.log('Agent logged in successfully:', agent);
      // Redirect or trigger further actions, like going to a dashboard
      // history.push("/dashboard");  // Example if using react-router
      localStorage.setItem('agent', JSON.stringify(agent));

      console.log('Agent logged in successfully:', agent);
      return response; // Return the response for further handling if needed
    })
    .catch((error) => {
      // Handle errors, such as invalid credentials or server issues
      console.error('Login failed:', error.response ? error.response.data.message : error.message);
      throw new Error(error.response ? error.response.data.message : 'Something went wrong');
    });
};
export const getAllAgentClients = async () => {
  try {
    const response = await API.get("/agent/allclients", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw error;
  }
};

// Get details for a specific client
export const getClientDetails = async (clientId) => {
  try {
    const response = await API.get(`/agent/getClientdata/${clientId}`, {
      withCredentials: true, // ✅ Add this line
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create a new client
export const addClient = (data) => API.post("/agent/addclient", data);

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



// Agent logout
export const logoutAgent = async () => {
  try {
    const response = await API.post("/agent/logout");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Search clients by name
export const searchClients = async (searchTerm) => {
  try {
    const token = localStorage.getItem("token");
    const response = await API.get(`/agent/search-clients?query=${searchTerm}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
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


export const AgentGetloanDetails = async (clientId) => {
  try {
    const response = await API.get(`/agent/viewclientloan/${clientId}/loans`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching loan detail:", error);
    throw error;
  }
};


export const AgentcollectEMI = (clientId, loanId, data, isAgent = true) => {
  const token = localStorage.getItem("accessToken"); // assuming you store it during login
  return API.post(
    `${isAgent ? '/agent' : '/admin'}/collectemi/${clientId}/${loanId}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};





export const AgetAgentEmiCollection = async (agentId) => {
  try {
    const response = await API.get(`/agent/getEmiCollection/${agentId}`);
    console.log("response", response);
    
    return response.data;
  } catch (error) {
    console.error("Error fetching agent EMI collection history:", error);
    throw error;
  }
};




export default API;
