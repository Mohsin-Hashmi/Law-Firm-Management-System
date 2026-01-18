

const express = require('express');
const userProfileRouter = express.Router();
const {
    getUserProfile,
    updateUserProfile,
    deleteUserProfile
} = require('../controllers/userprofile.controller');
const { userAuth } = require('../middlewares/authMiddleware');

userProfileRouter.get('/me', userAuth, getUserProfile);
userProfileRouter.put("/update/profile", userAuth, updateUserProfile)
module.exports = userProfileRouter;