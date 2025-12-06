const Faq = require("../models/objetos/Faq.class");

exports.criarPergunta = async (req, res) => {
    try {
        const { usuario_id, pergunta } = req.body;

        const novaPergunta = await Faq.criarPergunta(usuario_id, pergunta);
        res.status(201).json(novaPergunta);

    } catch (error) {
        console.error("Erro ao criar pergunta:", error);
        res.status(500).json({ erro: "Erro ao enviar pergunta ao FAQ" });
    }
};

exports.responderPergunta = async (req, res) => {
    try {
        const { id, resposta } = req.body;

        await Faq.responder(id, resposta);
        res.json({ mensagem: "Pergunta respondida com sucesso!" });

    } catch (error) {
        console.error("Erro ao responder pergunta:", error);
        res.status(500).json({ erro: "Erro ao responder pergunta" });
    }
};

exports.listarPublico = async (req, res) => {
    try {
        const perguntas = await Faq.listarPublico();
        res.json(perguntas);

    } catch (error) {
        console.error("Erro ao listar FAQ público:", error);
        res.status(500).json({ erro: "Erro ao listar FAQ público" });
    }
};

exports.listarAdmin = async (req, res) => {
    try {
        const perguntas = await Faq.listarAdmin();
        res.json(perguntas);

    } catch (error) {
        console.error("Erro ao listar FAQ admin:", error);
        res.status(500).json({ erro: "Erro ao listar FAQ admin" });
    }
};

exports.marcarFrequente = async (req, res) => {
    try {
        const { id, valor } = req.body;

        await Faq.marcarFrequente(id, valor);
        res.json({ mensagem: "Marcado como frequente!" });

    } catch (error) {
        console.error("Erro ao marcar pergunta como frequente:", error);
        res.status(500).json({ erro: "Erro ao marcar pergunta frequente" });
    }
};
