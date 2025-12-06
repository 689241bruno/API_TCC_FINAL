const express = require("express");
const router = express.Router();
const RedacaoController = require("../controllers/RedacaoController");

// 🟦 Redações do aluno
router.get("/aluno/:usuario_id", RedacaoController.listarRedacoes);

// 🟪 Temas
router.get("/tema", RedacaoController.listarTemas);
router.get("/tema/:id", RedacaoController.buscarTema);
router.post("/tema", RedacaoController.adicionarTema);
router.put("/tema/:id", RedacaoController.editarTema);
router.delete("/tema/:id", RedacaoController.deletarTema);

module.exports = router;