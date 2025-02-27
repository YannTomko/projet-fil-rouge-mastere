const express = require('express');
const multer = require('multer');
const { uploadFile, deleteFile, getAllFiles, getFile, getFileInfo } = require('../services/filesServices');
const { getStatistics } = require('../services/statisticServices');

const router = express.Router();

const upload = multer({ dest: 'uploads/' }); 

router.post('/upload', upload.single('file'), uploadFile);
router.delete('/delete/:id', deleteFile);
router.post('/getall', getAllFiles);
router.get('/get/:id', getFile);
router.get('/getinfo/:id', getFileInfo);
router.get('/statistics/:file_id', getStatistics);

module.exports = router;
