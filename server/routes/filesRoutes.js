const express = require('express');
const multer = require('multer');
const { uploadFile, deleteFile, getAllFiles, getFile } = require('../services/filesServices');

const router = express.Router();

const upload = multer({ dest: 'uploads/' }); 

router.post('/upload', upload.single('file'), uploadFile);
router.delete('/delete/:id', deleteFile);
router.post('/getall', getAllFiles);
router.get('/get/:id', getFile);

module.exports = router;
