const express = require("express");
const router = express.Router();
const DesafiosController = require("../controllers/DesafiosController");

// CRUD
router.get("/", DesafiosController.listarDesafios);
router.post("/", DesafiosController.criarDesafio);
router.put("/:id", DesafiosController.editarDesafio);
router.delete("/:id", DesafiosController.deletarDesafio);

router.get("/conquistas/:usuario_id", DesafiosController.listarConquistasUsuario);

// Progresso
router.get("/progresso/:usuario_id", DesafiosController.listarProgressoUsuario);
router.post("/progresso", DesafiosController.registrarProgresso);
router.put("/progresso/concluido", DesafiosController.marcarConcluida);

router.get("/materia/:materia", DesafiosController.listarPorMateria);

router.post("/progresso/incrementar", DesafiosController.incrementarProgresso);


module.exports = router;