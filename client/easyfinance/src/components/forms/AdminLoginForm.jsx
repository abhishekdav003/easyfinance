import { useState } from "react";
import { loginAdmin } from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function AdminLoginForm() {
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginAdmin(formData);
console.log('formData', formData);

      // Store the admin data in localStorage
      localStorage.setItem("admin", JSON.stringify(res.data.data));

      alert(res.data.message);

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 max-w-md mx-auto mt-10"
    >
      <input
        type="text"
        name="emailOrUsername"
        placeholder="Email or Username"
        onChange={handleChange}
        className="p-2 border rounded"
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
        className="p-2 border rounded"
        required
      />
      <button
        type="submit"
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
      >
        Login Admin
      </button>
    </form>
  );
}
