import { Router } from "express";
import { getAllUsersController, loginUserController, refreshTokenController, registerUserController } from "../controllers/authControllers";
import { authMiddleware } from "../middlewares/jwt";

const router = Router();

router.post("/register", registerUserController);
router.post("/login", loginUserController);
router.post("/refresh", refreshTokenController);
router.get("/all", authMiddleware, getAllUsersController);

export default router;
