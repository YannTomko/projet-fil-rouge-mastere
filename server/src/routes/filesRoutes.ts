import { Router } from "express";

import multer from "multer";
import { deleteFileController, getFileController, getFileInfoController, getUserFilesController, uploadFileController } from "../controllers/filesControllers";
import { getStatisticsController } from "../controllers/statisticsControlleurs";
import { authMiddleware } from "../middlewares/jwt";

const upload = multer({ dest: 'uploads/' }); 

const router = Router();

router.post('/upload', upload.single('file'), uploadFileController);
router.delete('/delete/:id', deleteFileController);
router.get('/:id', getFileController);
router.get('/user/:userid', authMiddleware, getUserFilesController);
router.get('/info/:id', getFileInfoController);
router.get('/statistics/:file_id', getStatisticsController);

export default router;
