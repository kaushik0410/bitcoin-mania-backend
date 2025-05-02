const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateUser, referralCount } = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/update-user', updateUser);
router.get('/referral-count/:referralCode', referralCount);

module.exports = router;
