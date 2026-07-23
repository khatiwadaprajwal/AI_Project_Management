import { Router } from "express";
import { register, login,verifyOtp,changePassword } from "./auth.controller";
import { validate } from "../../middleware/validate.middleware";
import { registerSchema, loginSchema, verifyOtpSchema, changePasswordSchema  } from "./auth.validation";
import { protect } from "./auth.middleware";
const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtp);
router.post("/login", validate(loginSchema), login);
router.post("/change-password", protect, validate(changePasswordSchema), changePassword);
export const authRoutes = router;
