const Questao = require("../models/objetos/Questao.class");

exports.listar = async (req, res) => {
    const data = await Questao.listar();
    res.json(data);
};

exports.buscar = async (req, res) => {
    const q = await Questao.buscarPorId(req.params.id);
    if (!q) return res.status(404).json({ erro: "Questão não encontrada" });
    res.json(q);
};

exports.criar = async (req, res) => {
    try {
        const id = await Questao.criar(req.body);
        res.json({ id });
    } catch (err) {
        console.error("Erro criar:", err);
        res.status(500).json({ erro: "Erro ao criar" });
    }
};

exports.editar = async (req, res) => {
    try {
        await Questao.editar(req.params.id, req.body);
        res.json({ ok: true });
    } catch (err) {
        console.error("Erro editar:", err);
        res.status(500).json({ erro: "Erro ao editar" });
    }
};

exports.deletar = async (req, res) => {
    await Questao.deletar(req.params.id);
    res.json({ ok: true });
};

exports.sortear = async (req, res) => {
    const data = await Questao.sortear(req.body.materia, req.body.tema, req.body.quantidade);
    res.json(data);
};

exports.verificar = async (req, res) => {
    const data = await Questao.verificarRespostas(req.body.respostas);
    res.json(data);
};