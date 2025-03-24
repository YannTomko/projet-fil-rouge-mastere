import { Router } from "express";
import { deleteAllUsers, getAllUsers, loginUser, registerUser } from "../services/authServices";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/all", getAllUsers);     
router.delete("/all", deleteAllUsers); 

export default router;
