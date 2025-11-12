<div align="center">

# 💰 EasyFinance — Finance & Loan Management System

🚀 A modern web application to manage **micro-finance lending**, **daily collection**, **client management**, and **agent monitoring** — built for small businesses and financial organizations.

🔹 Admin Panel • 🔹 Agent Panel • 🔹 Automated Loan Tracking  
🔹 Client Management • 🔹 Daily Collection Reporting  

<img width="1350" height="642" alt="image" src="https://github.com/user-attachments/assets/5b3abf1e-0853-4363-a217-4cbbd7deeaf0" />


---

### 🌐 Live Demo

| Platform | URL |
|----------|-----|
| ✅ Frontend (Vercel) | https://easyfinance-seven.vercel.app/ |
| ✅ Backend API (Render) | https://easyfinance-zw9p.onrender.com/ |

</div>

---

## ✨ Features

### 👨‍💼 Admin Panel
- Add new clients with full KYC details
- Create loan applications (daily/weekly/monthly installments)
- Approve & reject loans
- Assign loan to agents
- View loan status (Active / Completed / Overdue)
- Dashboard analytics and revenue tracking

### 🧑‍💼 Agent Panel
- Daily collection tracking
- View assigned clients & loans
- Mark EMI payments
- Track pending amounts

### 👥 Client Management
- Add / Edit / Delete clients
- Track loan history
- Due reminder automation (SMS/Email ready)

### 💸 Loan Lifecycle
- Loan creation → Approval → EMI Collection → Completion

### 📊 Reporting
- Daily report (collected / pending / overdue)
- Export support (CSV / Excel ready)
- Visual dashboards

---

## 🏗️ Tech Stack

| Category | Tech Used |
|----------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Deployment | Frontend → Vercel • Backend → Render |
| Auth & Security | JWT Authentication, bcrypt |
| External Services | Cloudinary (for image upload support) |

---

## 🔧 Project Setup

### 📌 Clone the repository
```bash
git clone https://github.com/abhishekdav003/easyfinance.git
cd easyfinance


▶️ Backend Setup (server/)
cd server
npm install
npm run dev

Create .env inside server/:

MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret_key
CLOUDINARY_API_KEY=XXXX
CLOUDINARY_API_SECRET=XXXX


▶️ Frontend Setup (client/easyfinance/)
cd client/easyfinance
npm install
npm run dev


Create .env in the frontend folder:

VITE_API_BASE_URL=https://easyfinance-zw9p.onrender.com


📦 Deployment
Part	Service	Status
Frontend	✅ Vercel	https://easyfinance-seven.vercel.app/

Backend	✅ Render	https://easyfinance-zw9p.onrender.com/

DB (MongoDB)	✅ MongoDB Atlas	Connected


🤝 Contributing

Love the project? You can contribute!
Just open an issue or send a PR. 😊

⭐ Show some Love!

If this project helped you, give it a star ⭐ on GitHub!
Your star motivates me to build more awesome projects.


Made with ❤️ by Abhishek Kumar

🔗 GitHub: https://github.com/abhishekdav003

🔗 LinkedIn: https://linkedin.com/in/abhishekr03/


