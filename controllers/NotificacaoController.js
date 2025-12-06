const Notificacao = require("../models/objetos/Notificacao.class");

exports.listar = async (req, res) => {
    try {
        const lista = await Notificacao.listar();
        res.json(lista);
    } catch (err) {
        console.error("Erro ao listar notificações:", err);
        res.status(500).json({ erro: "Erro interno ao listar notificações" });
    }
};

exports.criar = async (req, res) => {
    try {
        const nova = await Notificacao.criar(req.body);
        res.json(nova);
    } catch (err) {
        console.error("Erro ao criar notificação:", err);
        res.status(500).json({ erro: "Erro interno ao criar notificação" });
    }
};

exports.editar = async (req, res) => {
    try {
        const { id } = req.params;
        const editada = await Notificacao.editar(id, req.body);
        res.json(editada);
    } catch (err) {
        console.error("Erro ao editar notificação:", err);
        res.status(500).json({ erro: "Erro interno ao editar notificação" });
    }
};

exports.deletar = async (req, res) => {
    try {
        const { id } = req.params;
        await Notificacao.deletar(id);
        res.json({ msg: "Notificação deletada com sucesso" });
    } catch (err) {
        console.error("Erro ao deletar notificação:", err);
        res.status(500).json({ erro: "Erro interno ao deletar notificação" });
    }
};