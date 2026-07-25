import { Router } from "express";
import rateLimit from "express-rate-limit";
import { register, login,verifyOtp,changePassword } from "./auth.controller";
import { validate } from "../../middleware/validate.middleware";
import { registerSchema, loginSchema, verifyOtpSchema, changePasswordSchema  } from "./auth.validation";
import { protect } from "./auth.middleware";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

const router = Router();
router.use(authLimiter);

router.post("/register", validate(registerSchema), register);
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtp);
router.post("/login", validate(loginSchema), login);
router.post("/change-password", protect, validate(changePasswordSchema), changePassword);
export const authRoutes = router;
