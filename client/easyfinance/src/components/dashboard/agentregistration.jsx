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
    <div className="bg-white shadow-lg rounded-xl p-6 md:p-8 mb-8">
  <div className="flex items-center justify-between mb-6 border-b pb-4">
    <div className="flex items-center">
      <div className="p-2 mr-3 bg-blue-100 rounded-full">
        <UserPlus size={22} className="text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800">Register New Agent</h3>
    </div>
    <div className="hidden md:flex items-center text-sm text-gray-500">
      <span>* Required fields</span>
    </div>
  </div>

  <form onSubmit={handleSubmit}>
    <div className="space-y-6">
      {/* Personal Information Section */}
      <div>
        <h4 className="text-md font-medium text-gray-700 mb-3">Personal Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="col-span-1">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="agentusername"
                value={formData.agentusername}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Agent Username"
                required
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">@</span>
              </div>
            </div>
          </div>
          
          <div className="col-span-1">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John Doe"
              required
            />
          </div>
          
          <div className="col-span-1">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="example@email.com"
              required
            />
          </div>
          
          <div className="col-span-1">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Father's Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fathername"
              value={formData.fathername}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Father's Name"
              required
            />
          </div>
        </div>
      </div>
      
      {/* Security Section */}
      <div className="pt-2">
        <h4 className="text-md font-medium text-gray-700 mb-3">Account Security</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="col-span-1">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
          </div>
          
          <div className="col-span-1">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Profile Photo
            </label>
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <input
                type="file"
                name="photo"
                id="photo-upload"
                accept="image/*"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    photo: e.target.files[0],
                  }))
                }
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex items-center p-4">
                {formData.photo ? (
                  <div className="flex items-center w-full space-x-3">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden bg-gray-200">
                      <img
                        src={URL.createObjectURL(formData.photo)}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {formData.photo.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(formData.photo.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center w-full">
                    <div className="mr-3 p-2 rounded-full bg-blue-100 flex-shrink-0">
                      <UserPlus size={18} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">
                        Click to upload photo
                      </p>
                      <p className="text-xs text-gray-500">
                        JPG, PNG or GIF (Max 2MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Submit Button */}
    <div className="mt-8 pt-5 border-t border-gray-200">
      <div className="flex justify-end">
        <button
          type="button"
          className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center text-sm font-medium shadow-sm"
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
      </div>
    </div>
  </form>
</div>
  );
};

export default AgentRegisterForm;
