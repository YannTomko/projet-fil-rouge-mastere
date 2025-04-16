import { Router } from "express";
import { loginUserController, refreshTokenController, registerUserController } from "../controllers/authControllers";

const router = Router();

router.post("/register", registerUserController);
router.post("/login", loginUserController);
router.post("/refresh", refreshTokenController);

export default router;
