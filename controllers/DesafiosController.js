const Desafios = require("../models/objetos/Desafios.class");

exports.listarDesafios = async (req, res) => {
    try {
        const desafios = await Desafios.listar();
        res.json(desafios);
    } catch (err) {
        console.error("Erro ao listar desafios:", err);
        res.status(500).json({ erro: "Erro ao listar desafios" });
    }
};

exports.listarConquistasUsuario = async (req, res) => {
    try {
        const { usuario_id } = req.params;

        if (!usuario_id)
            return res.status(400).json({ erro: "usuario_id é obrigatório" });

        const conquistas = await Desafios.listarConquistas(usuario_id);
        res.json(conquistas);

    } catch (err) {
        console.error("Erro ao listar conquistas:", err);
        res.status(500).json({ erro: "Erro ao listar conquistas" });
    }
};


exports.criarDesafio = async (req, res) => {
    try {
        const { titulo, descricao, materia, quantidade, xp, img } = req.body;

        if (!titulo) return res.status(400).json({ erro: "Título é obrigatório" });
        if (!materia) return res.status(400).json({ erro: "Matéria é obrigatória" });
        if (!quantidade) return res.status(400).json({ erro: "Quantidade é obrigatória" });

        const id = await Desafios.criar({
            titulo,
            descricao,
            materia,
            quantidade,
            xp,
            img
        });

        res.status(201).json({ mensagem: "Desafio criado", id });

    } catch (err) {
        console.error("Erro ao criar desafio:", err);
        res.status(500).json({ erro: "Erro ao criar desafio" });
    }
};

exports.editarDesafio = async (req, res) => {
    try {
        const { id } = req.params;

        await Desafios.editar(id, req.body);

        res.json({ mensagem: "Desafio atualizado" });

    } catch (err) {
        console.error("Erro ao editar desafio:", err);
        res.status(500).json({ erro: "Erro ao editar desafio" });
    }
};

exports.deletarDesafio = async (req, res) => {
    try {
        const { id } = req.params;
        await Desafios.deletar(id);
        res.json({ mensagem: "Desafio deletado" });
    } catch (err) {
        console.error("Erro ao deletar desafio:", err);
        res.status(500).json({ erro: "Erro ao deletar desafio" });
    }
};

// PROGRESSO

exports.registrarProgresso = async (req, res) => {
    try {
        const { usuario_id, desafio_id, progresso, concluida } = req.body;

        if (!usuario_id || !desafio_id)
            return res.status(400).json({ erro: "usuario_id e desafio_id são obrigatórios" });

        await Desafios.registrarProgresso(usuario_id, desafio_id, progresso, concluida);

        res.json({ mensagem: "Progresso registrado" });

    } catch (err) {
        console.error("Erro ao registrar progresso:", err);
        res.status(500).json({ erro: "Erro ao registrar progresso" });
    }
};

exports.listarProgressoUsuario = async (req, res) => {
    try {
        const { usuario_id } = req.params;

        if (!usuario_id) {
            return res.status(400).json({ erro: "usuario_id é obrigatório" });
        }

        const progresso = await Desafios.listarProgresso(usuario_id);

        res.json(progresso);

    } catch (err) {
        console.error("Erro ao listar progresso do usuário:", err);
        res.status(500).json({ erro: "Erro ao listar progresso" });
    }
};

exports.marcarConcluida = async (req, res) => {
    try {
        const { usuario_id, desafio_id } = req.body;

        if (!usuario_id || !desafio_id)
            return res.status(400).json({ erro: "usuario_id e desafio_id são obrigatórios" });

        await Desafios.marcarConcluida(usuario_id, desafio_id);

        res.json({ mensagem: "Desafio concluído!" });

    } catch (err) {
        console.error("Erro ao marcar desafio como concluído:", err);
        res.status(500).json({ erro: "Erro ao marcar como concluído" });
    }
};

exports.listarPorMateria = async (req, res) => {
    try {
        const { materia } = req.params;
        const desafios = await Desafios.listarPorMateria(materia);
        res.json(desafios);
    } catch (err) {
        console.error("Erro ao listar desafios por matéria:", err);
        res.status(500).json({ erro: "Erro ao listar desafios" });
    }
};

exports.incrementarProgresso = async (req, res) => {
    try {
        const { usuario_id, desafio_id } = req.body;

        await Desafios.incrementarProgresso(usuario_id, desafio_id);

        res.json({ mensagem: "Progresso atualizado!" });
    } catch (err) {
        console.error("Erro ao atualizar progresso do desafio:", err);
        res.status(500).json({ erro: "Erro ao atualizar progresso" });
    }
};

