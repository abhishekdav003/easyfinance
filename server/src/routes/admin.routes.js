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
  collectEMI
  
} from "../controllers/admin.controller.js";
import { verifyAdminJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(upload.single("profileImage")  , registerAdmin) 
router.route("/login").post(adminLogin) 

router.route("/addagent").post(upload.single("photo") ,addAgent) 



// secured routes 
//logout admin ✅
router.route("/logout").post(verifyAdminJwt ,logoutAdmin) 

// admin add loan to client ✅
router.route("/addloantoclient/:clientId").post(verifyAdminJwt ,addLoanToClient) 

// admin remove agent ✅
router.route("/deleteagent/:agentId").delete(verifyAdminJwt , removeAgent) 

// admin remove client ✅
router.route("/deleteclient/:clientId").delete(verifyAdminJwt , removeClient) 

// admin view client loan list ✅
router.route("/viewclientloan/:clientId/loans").get(verifyAdminJwt , loanList) 

// admin remove loan
router.route("/removeloan/:clientId/loans/:loanId").delete(verifyAdminJwt , removeLoanFromClient) 

// admin get client all details ✅
router.route("/getClientdata/:clientId").get(verifyAdminJwt , clientDetails) 

// admin get agent all details
router.route("/allagents").get(verifyAdminJwt , agentList)

// admin get all clients list  ✅
router.route("/allclients").get(verifyAdminJwt , clientList) 

// admin get agent all details
router.route("/getagentdetails/:agentId").get(verifyAdminJwt , agentDetails)

// router.route("/getClientdetails/:agentId").get(verifyAdminJwt , clientDetails)

// admin get dashboard analytics ✅
router.route("/dashboard").get(verifyAdminJwt , getAdminDashboardAnalytics) 

// admin add client ✅
router.route("/addclient").post(upload.single("file") , verifyAdminJwt , addClient) 


// loan details 
router.route("/getloandetails/:loanId").get(verifyAdminJwt , loanDetails)
router.route("/collectemi/:clientId/:loanId").post(verifyAdminJwt , collectEMI); 
export default router;
