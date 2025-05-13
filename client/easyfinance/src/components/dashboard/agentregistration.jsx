// components/agents/AgentRegisterForm.jsx
import React, { useState } from "react";
import { UserPlus, Loader } from "lucide-react";
import { registerAgent } from "../../services/api.js";

const AgentRegisterForm = ({ onAgentAdded }) => {
  const [formData, setFormData] = useState({
    agentusername: "",
    fullname: "",
    email: "",
    fathername: "",
    password: "",
    photo: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formPayload = new FormData();
      formPayload.append("agentusername", formData.agentusername);
      formPayload.append("fullname", formData.fullname);
      formPayload.append("email", formData.email);
      formPayload.append("fathername", formData.fathername);
      formPayload.append("password", formData.password);
      formPayload.append("photo", formData.photo); // File object

      await registerAgent(formPayload);

      // Clear form
      setFormData({
        agentusername: "",
        fullname: "",
        email: "",
        fathername: "",
        password: "",
        photo: "",
      });

      alert("Agent registered successfully!");

      // Refresh agent list
      if (onAgentAdded) onAgentAdded();
    } catch (error) {
      console.error("Error registering agent:", error);
      alert(
        `Failed to register agent: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
      <div className="flex items-center mb-4">
        <UserPlus size={20} className="text-blue-600 mr-2" />
        <h3 className="text-lg font-medium">Register New Agent</h3>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Username
            </label>
            <input
              type="text"
              name="agentusername"
              value={formData.agentusername}
              onChange={handleChange}
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Agent Username"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Full Name"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email Address"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Father's Name
            </label>
            <input
              type="text"
              name="fathername"
              value={formData.fathername}
              onChange={handleChange}
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Father's Name"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Password"
              required
            />
          </div>
          <div>
          
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Upload Photo
            </label>
            <td className="px-6 py-4 border-b border-gray-200 bg-yellow-100">
            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  photo: e.target.files[0],
                }))
              }
            />
            </td>
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
        >
          {isSubmitting ? (
            <>
              <Loader size={16} className="animate-spin mr-2" />
              Registering...
            </>
          ) : (
            <>
              <UserPlus size={16} className="mr-2" />
              Register Agent
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AgentRegisterForm;
