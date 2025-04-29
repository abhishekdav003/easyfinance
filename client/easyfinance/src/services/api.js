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




// import API from 'your-api-instance'; // Ajust to your API setup

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
      // localStorage.setItem('accessToken', accessToken);
      // localStorage.setItem('refreshToken', refreshToken);

      // Set the agent data in your app state (assuming you are using Redux or Context API)
      // dispatch({ type: 'SET_AGENT', payload: agent }); // Example if using Redux

      console.log('Agent logged in successfully:', agent);
      // Redirect or trigger further actions, like going to a dashboard
      // history.push("/dashboard");  // Example if using react-router

      return response; // Return the response for further handling if needed
    })
    .catch((error) => {
      // Handle errors, such as invalid credentials or server issues
      console.error('Login failed:', error.response ? error.response.data.message : error.message);
      throw new Error(error.response ? error.response.data.message : 'Something went wrong');
    });
};




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
export const collectEMI = (clientId, loanId, data, isAgent = false) =>
  API.post(`${isAgent ? '/agent' : '/admin'}/collectemi/${clientId}/${loanId}`, data);
