
const express = require('express');
const lawyerRoutes= express.Router();
const {
    getLawyerById,
    updateLawyer,
    deleteLawyer
}= require("../controllers/lawyer.controller");
const { userAuth, firmAdminAuth } = require("../middlewares/authMiddleware");





module.exports= lawyerRoutes;