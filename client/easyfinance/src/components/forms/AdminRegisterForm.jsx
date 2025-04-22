import { useState } from "react";
import { registerAdmin } from "../../services/api";

export default function AdminRegisterForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    profileImage: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  console.log(formData);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));

    try {
      const res = await registerAdmin(data);

      // Ensure res is not undefined and contains the data property
      if (res && res.data) {
        alert(res.data.message);
      } else {
        alert("Registration failed, no response data.");
      }
    } catch (err) {
      // Improved error handling with null checks
      const errorMessage = err?.response?.data?.message || "An error occurred during registration";
      alert(errorMessage);
      console.error("Error during registration:", err); // Log the error for debugging
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto mt-10">
      <input
        type="text"
        name="username"
        placeholder="Username"
        onChange={handleChange}
        className="p-2 border rounded"
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={handleChange}
        className="p-2 border rounded"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
        className="p-2 border rounded"
      />
      <input
        type="file"
        name="profileImage"
        onChange={handleChange}
        className="p-2 border rounded"
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Register Admin
      </button>
    </form>
  );
}
