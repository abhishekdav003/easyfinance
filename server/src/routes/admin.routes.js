import { Router } from "express";
import {
  adminLogin,
  addAgent,
  registerAdmin,
} from "../controllers/admin.controller.js";
import { isAdmin } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(upload.single("profileImage")  , registerAdmin) 
router.route("/login").post(adminLogin) 
router.route("/addagent").post(upload.single("photo") ,addAgent) 

export default router;
