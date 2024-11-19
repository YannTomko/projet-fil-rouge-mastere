const express = require('express');
const { registerUser, loginUser, getAllUsers, deleteAllUsers } = require('../services/authServices');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/getall', getAllUsers);
router.post('/deleteall', deleteAllUsers);

module.exports = router;
