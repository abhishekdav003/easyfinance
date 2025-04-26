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
  loanList
  
} from "../controllers/admin.controller.js";
import { verifyAdminJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(upload.single("profileImage")  , registerAdmin) 
router.route("/login").post(adminLogin) 

router.route("/addagent").post(upload.single("photo") ,addAgent) 



// secured routes 
router.route("/logout").post(verifyAdminJwt ,logoutAdmin) 
router.route("/addloantoclient/:clientId").post(verifyAdminJwt ,addLoanToClient) 
router.route("/deleteagent/:agentId").delete(verifyAdminJwt , removeAgent) 
router.route("/deleteclient/:clientId").delete(verifyAdminJwt , removeClient) 
router.route("/viewclientloan/:clientId/loans").get(verifyAdminJwt , loanList) 
router.route("/removeloan/:clientId/loans/:loanId").delete(verifyAdminJwt , removeLoanFromClient) 
router.route("/getClientdata/:clientId").get(verifyAdminJwt , clientDetails) 
router.route("/allagents").get(verifyAdminJwt , agentList) 
router.route("/allclients").get(verifyAdminJwt , clientList) 
router.route("/getagentdetails/:agentId").get(verifyAdminJwt , agentDetails)
router.route("/getClientdetails/:agentId").get(verifyAdminJwt , clientDetails)
router.route("/dashboard").get(verifyAdminJwt , getAdminDashboardAnalytics) 
router.route("/addclient").post(upload.single("file") , verifyAdminJwt , addClient) 
export default router;
