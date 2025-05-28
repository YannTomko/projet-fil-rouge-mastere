import { Router } from "express";

import multer from "multer";
import { deleteFileController, getFileController, getFileInfoController, getUserFilesController, uploadFileController } from "../controllers/filesControllers";
import { authMiddleware } from "../middlewares/jwt";

const upload = multer({ dest: 'uploads/' }); 

const router = Router();

router.post('/upload', authMiddleware, upload.single('file'), uploadFileController);
router.delete('/delete/:id', authMiddleware, deleteFileController);
router.get('/:id', authMiddleware, getFileController);
router.get('/user/:userid', authMiddleware, getUserFilesController);
router.get('/info/:id', authMiddleware, getFileInfoController);

export default router;
