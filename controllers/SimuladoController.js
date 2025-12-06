const Simulado = require("../models/objetos/Simulado.class");

const SimuladoController = {
  async listar(req, res) {
    try {
      const { id } = req.query;

      if (!id || id === "undefined" || id === "null") {
        console.warn("Tentativa de listar simulados com ID inválido:", id);
        return res.json([]);
      }

      const rows = await Simulado.listarPorUsuario(id);
      res.json(rows);
    } catch (err) {
      console.error("[ERRO LISTAR SIMULADOS]", err);
      res.status(500).json({ erro: "Erro ao listar simulados" });
    }
  },

  async gerar(req, res) {
    try {
      const { quantidade, materia } = req.body;
      const questoes = await Simulado.gerarSimulado(quantidade, materia);
      res.json(questoes);
    } catch (err) {
      console.error("[ERRO GERAR SIMULADO]", err);
      res.status(500).json({ erro: "Erro ao gerar simulado" });
    }
  },

  async corrigir(req, res) {
    try {
      const { respostas } = req.body;
      const resultado = await Simulado.corrigir(respostas);
      res.json(resultado);
    } catch (err) {
      console.error("[ERRO CORRIGIR SIMULADO]", err);
      res.status(500).json({ erro: "Erro ao corrigir simulado" });
    }
  },

  async salvarResultado(req, res) {
    try {
      const id = await Simulado.salvarResultado(req.body);
      res.json({ sucesso: true, id });
    } catch (err) {
      console.error("[ERRO SALVAR RESULTADO]", err);
      res.status(500).json({ erro: "Erro ao salvar resultado" });
    }
  },

  async deletar(req, res) {
    try {
      const { id } = req.params;
      await Simulado.deletar(id);
      res.json({ mensagem: "Simulado deletado com sucesso!" });
    } catch (err) {
      console.error("[ERRO DELETAR SIMULADO]", err);
      res.status(500).json({ erro: "Erro ao deletar simulado" });
    }
  },
};

module.exports = SimuladoController;
