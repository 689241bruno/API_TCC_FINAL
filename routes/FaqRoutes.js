const express = require("express");
const router = express.Router();
const faqController = require("../controllers/FaqController");

// Usuário envia dúvida
router.post("/faq/perguntar", faqController.criarPergunta);

// Admin responde
router.post("/faq/responder", faqController.responderPergunta);

// Lista pública (somente respondidas)
router.get("/faq/publico", faqController.listarPublico);

// Lista admin (todas)
router.get("/faq/admin", faqController.listarAdmin);

// Admin marca pergunta como frequente
router.post("/faq/frequente", faqController.marcarFrequente);

module.exports = router;
