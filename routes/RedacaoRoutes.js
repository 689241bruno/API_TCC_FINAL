const express = require("express");
const router = express.Router();
const RedacaoController = require("../controllers/RedacaoController");

router.get("/", (req,res) => {
    const routes = [];
    router.stack.forEach((middleware) => {
        if (middleware.route) {
        const path = middleware.route.path;
        const method = Object.keys(middleware.route.methods).join(", ").toUpperCase();
        routes.push({ path, method });
        }
    });

    res.json({
        message: "Raiz da API",
        availableRoutes: routes,
    });

});

router.get("/aluno/:id", RedacaoController.getRedacaoByAlunoID);
router.get("/:id", RedacaoController.getRedacaoByID)

router.post("/salvar", RedacaoController.salvar);

// 🟦 Redações do aluno
router.get("/aluno/:usuario_id", RedacaoController.listarRedacoes);

// 🟪 Temas
router.get("/tema", RedacaoController.listarTemas);
router.get("/tema/:id", RedacaoController.buscarTema);
router.post("/tema", RedacaoController.adicionarTema);
router.put("/tema/:id", RedacaoController.editarTema);
router.delete("/tema/:id", RedacaoController.deletarTema);

module.exports = router;