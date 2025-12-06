const express = require("express");
const router = express.Router();
const SimuladoController = require("../controllers/SimuladoController");

router.get("/", SimuladoController.listar);
router.post("/gerar", SimuladoController.gerar);
router.post("/corrigir", SimuladoController.corrigir);
router.post("/salvar", SimuladoController.salvarResultado);
router.delete("/:id", SimuladoController.deletar);

module.exports = router;
