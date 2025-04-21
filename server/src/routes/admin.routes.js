import { Router } from "express";
import {
  adminLogin,
  addAgent,
  registerAdmin,
  logoutAdmin,
  removeAgent,
  agentList
} from "../controllers/admin.controller.js";
import { verifyAdminJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(upload.single("profileImage")  , registerAdmin) 
router.route("/login").post(adminLogin) 

router.route("/addagent").post(upload.single("photo") ,addAgent) 



// secured routes 
router.route("/logout").post(verifyAdminJwt ,logoutAdmin) 
router.route("/deleteagent/:agentId").delete(verifyAdminJwt , removeAgent) 
router.route("/allagents").get(verifyAdminJwt , agentList) 
export default router;
