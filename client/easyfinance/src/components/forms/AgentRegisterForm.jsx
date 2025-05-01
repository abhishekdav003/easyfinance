// import { useState } from "react";
// import { registerAgent } from "../../services/api";

// export default function AgentRegisterForm() {
//   const [formData, setFormData] = useState({
//     fullname: "",
//     email: "",
//     agentusername: "",
//     password: "",
//     fathername: "",
//     photo: null,
//   });

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     setFormData({ ...formData, [name]: files ? files[0] : value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const data = new FormData();
//     Object.entries(formData).forEach(([key, value]) => data.append(key, value));

//     try {
//       const res = await registerAgent(data);
//       alert(res.data.message);
//     } catch (err) {
//       alert(err.response.data.message);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto mt-10">
//       <input type="text" name="fullname" placeholder="Full Name" onChange={handleChange} className="p-2 border rounded" />
//       <input type="email" name="email" placeholder="Email" onChange={handleChange} className="p-2 border rounded" />
//       <input type="text" name="agentusername" placeholder="Agent Username" onChange={handleChange} className="p-2 border rounded" />
//       <input type="password" name="password" placeholder="Password" onChange={handleChange} className="p-2 border rounded" />
//       <input type="text" name="fathername" placeholder="Father's Name" onChange={handleChange} className="p-2 border rounded" />
//       <input type="file" name="photo" onChange={handleChange} className="p-2 border rounded" />
//       <button type="submit" className="bg-purple-500 text-white px-4 py-2 rounded">Register Agent</button>
//     </form>
//   );
// }
