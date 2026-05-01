import { Router } from "express";
import { login, me, register, updateProfile } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, me);
router.put("/me", authMiddleware, updateProfile);

export default router;
