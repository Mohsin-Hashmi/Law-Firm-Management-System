

const express= require('express');
const superAdminRoutes = express.Router();
const superAdminMessage = require('../controllers/superAdmin.controller');
const  { userAuth, superAdminAuth }= require('../middlewares/authMiddleware')
superAdminRoutes.get("/super-admin", userAuth, superAdminAuth, superAdminMessage)
module.exports = superAdminRoutes