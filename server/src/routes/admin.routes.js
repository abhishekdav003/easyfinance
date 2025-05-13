import { Router } from "express";
import {
  adminLogin,
  addAgent,
  registerAdmin,
  logoutAdmin,
  removeAgent,
  agentList,
  addClient,
  removeClient,
  clientList,
  clientDetails,
  addLoanToClient,
  removeLoanFromClient,
  getAdminDashboardAnalytics,
  agentDetails,
  loanList,
  loanDetails,
  collectEMI,
  viewEmiCollectionHistory,
  getEmiCollectionData,
  updateLoanStatus,
  TodayCollection,
  getDefaultEmi,
  payDefaultEmi,
  getDefaultEmiById,
} from "../controllers/admin.controller.js";
import { verifyAdminJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

import {
  requestPasswordReset,
  verifyOTP,
  resetPassword,
} from "../controllers/auth.controller.js";

const router = Router();

// =================== Public Routes ===================

// Admin registration & login
router.post("/register", upload.single("profileImage"), registerAdmin);
router.post("/login", adminLogin);

// Password reset
router.post("/request-password-reset", requestPasswordReset);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

// Agent management
router.post("/addagent", upload.single("photo"), addAgent);

// =================== Protected Routes ===================

// Logout
router.post("/logout", verifyAdminJwt, logoutAdmin);

// Add client
router.post(
  "/addclient",
  upload.fields([
    { name: "clientPhoto", maxCount: 1 },
    { name: "shopPhoto", maxCount: 1 },
    { name: "housePhoto", maxCount: 1 },
    { name: "documents", maxCount: 10 },
  ]),
  verifyAdminJwt,
  addClient
);

// Agent routes
router.delete("/deleteagent/:agentId", verifyAdminJwt, removeAgent);
router.get("/allagents", verifyAdminJwt, agentList);
router.get("/getagentdetails/:agentId", verifyAdminJwt, agentDetails);

// Client routes
router.delete("/deleteclient/:clientId", verifyAdminJwt, removeClient);
router.get("/allclients", verifyAdminJwt, clientList);
router.get("/getClientdata/:clientId", verifyAdminJwt, clientDetails);

// Loan routes
router.post("/addloantoclient/:clientId", verifyAdminJwt, addLoanToClient);
router.delete(
  "/removeloan/:clientId/loans/:loanId",
  verifyAdminJwt,
  removeLoanFromClient
);
router.delete(
  "/deleteLoan/:clientId/:loanId",
  verifyAdminJwt,
  removeLoanFromClient
); // Optional alias
router.get("/viewclientloan/:clientId/loans", verifyAdminJwt, loanList);
router.get("/getloandetails/:loanId", verifyAdminJwt, loanDetails);
router.post(
  "/updateLoanStatus/:clientId/:loanId/status",
  verifyAdminJwt,
  updateLoanStatus
);

// EMI Collection
router.post("/collectemi/:clientId/:loanId", verifyAdminJwt, collectEMI);
router.get(
  "/viewEmiCollectionHistory/:clientId/:loanId",
  verifyAdminJwt,
  viewEmiCollectionHistory
);
router.get("/getEmiCollection/:agentId", verifyAdminJwt, getEmiCollectionData);
router.get("/today-collections", verifyAdminJwt, TodayCollection);

// Default EMI
router.get("/clients/default-emis", verifyAdminJwt, getDefaultEmi);
router.get(
  "/clients/:clientId/default-emis",
  verifyAdminJwt,
  getDefaultEmiById
);
router.post(
  "/clients/:clientId/loans/:loanId/pay-default-emi",
  verifyAdminJwt,
  payDefaultEmi
);

// Dashboard
router.get("/dashboard", verifyAdminJwt, getAdminDashboardAnalytics);

export default router;
