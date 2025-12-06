const express = require("express");
const router = express.Router();
const controller = require("../controllers/QuestaoController");

router.get("/", controller.listar);
router.get("/:id", controller.buscar);
router.post("/", controller.criar);
router.put("/:id", controller.editar);
router.delete("/:id", controller.deletar);
router.post("/sortear", controller.sortear);
router.post("/verificar", controller.verificar);

module.exports = router;