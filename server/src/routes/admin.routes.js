import express from "express";
import {
  adminLogin,
  addAgent,
  registerAdmin,
} from "../controllers/admin.controller.js";
import { isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", registerAdmin); // ✅ this is the new one
router.post("/login", adminLogin);
router.post("/add-agent", isAdmin, addAgent);

export default router;
