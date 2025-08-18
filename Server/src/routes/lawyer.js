
const express = require('express');
const lawyerRoutes= express.Router();
const {
    getAllLawyer,
    getLawyerById,
    updateLawyer,
    deleteLawyer
}= require("../controllers/lawyer.controller");
const { userAuth, firmAdminAuth } = require("../middlewares/authMiddleware");


lawyerRoutes.get("/lawyers", userAuth, firmAdminAuth, getAllLawyer);
lawyerRoutes.get("/lawyer/:id", userAuth, firmAdminAuth, getLawyerById);
lawyerRoutes.put("/lawyer/:id", userAuth, firmAdminAuth, updateLawyer);
lawyerRoutes.delete("/lawyer/:id",userAuth, firmAdminAuth, deleteLawyer);


module.exports= lawyerRoutes;