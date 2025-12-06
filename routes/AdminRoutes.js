const express = require("express");
const router = express.Router();
const adminController = require("../controllers/AdminController");

router.get("/admins", adminController.listarAdmins);
router.post("/cadadmin", adminController.cadastrarAdmin);

module.exports = router;