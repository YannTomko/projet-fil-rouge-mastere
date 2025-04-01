import { Router } from "express";
import { deleteFile, getAllFiles, getFile, getFileInfo, uploadFile } from "../services/filesServices";
import { getStatistics } from "../services/statisticServices";
import multer from "multer";

const upload = multer({ dest: 'uploads/' }); 

const router = Router();

router.post('/upload', upload.single('file'), uploadFile);
router.delete('/delete/:id', deleteFile);
router.get('/all', getAllFiles);
router.get('/:id', getFile);
router.get('/info/:id', getFileInfo);
router.get('/statistics/:file_id', getStatistics);

export default router;
