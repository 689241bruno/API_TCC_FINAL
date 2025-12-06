const Professor = require("../models/usuarios/Professor.class");
const Aluno = require("../models/usuarios/Aluno.class")

exports.listarProfessores = async (req, res) => {
    try {
        const professores = await Professor.listar();
        res.json(professores);
    } catch (err) {
        console.error("Erro ao listar professores:", err);
        res.status(500).json({ erro: "Erro ao listar professores!" });
    }
};

exports.cadastrarProfessor = async (req, res) => {
    try {
        const { usuario_id, materia } = req.body;

        const pool = require("../config/db");
        const connection = await pool.getConnection();

        const result = await Professor.cadastrar(usuario_id, materia || null, connection);
        connection.release();

        res.status(201).json({
            mensagem: "Professor cadastrado com sucesso!",
            result
        });
    } catch (err) {
        console.error("Erro ao cadastrar professor:", err);
        res.status(500).json({ erro: "Erro ao cadastrar professor!" });
    }
};

exports.editarProfessor = async (req, res) => {
    const { id } = req.params;
    const { materia } = req.body;

    const pool = require("../config/db");
    const connection = await pool.getConnection();

    try {
        if (!materia) throw new Error("Matéria não informada.");

        await connection.query(
            "UPDATE professores SET materia = ? WHERE usuario_id = ?",
            [materia, id]
        );

        connection.release();
        res.json({ mensagem: "Professor atualizado com sucesso!" });
    } catch (err) {
        connection.release();
        console.error("Erro ao editar professor:", err);
        res.status(500).json({ erro: "Erro ao editar professor!" });
    }
};

exports.deletarProfessor = async (req, res) => {
    try {
        const { usuario_id } = req.params;
        console.log("Requisição deletarProfessor:", { usuario_id });

        await Professor.deletar(usuario_id);
        res.json({ mensagem: "Professor deletado com sucesso!" });
    } catch (err) {
        console.error("Erro ao deletar professor:", err);
        res.status(500).json({ erro: "Erro ao deletar professor." });
    }
};

exports.editarMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, materia, tema, subtema } = req.body;
        const arquivo = req.file ? req.file.filename : null;

        await Professor.editarMaterial(id, { titulo, materia, tema, subtema, arquivo });

        res.json({ mensagem: "Material atualizado com sucesso!" });
    } catch (err) {
        console.error("Erro ao editar material:", err);
        res.status(500).json({ erro: "Erro ao editar material!" });
    }
};

exports.deletarMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        await Professor.deletarMaterial(id);
        res.json({ mensagem: "Material excluído com sucesso!" });
    } catch (err) {
        console.error("Erro ao deletar material:", err);
        res.status(500).json({ erro: "Erro ao deletar material!" });
    }
};

exports.listarRedacoesPendentes = async (req, res) => {
    try {
        const pendentes = await Professor.buscarRedacoesPendentes();
        res.json(pendentes);
    } catch (err) {
        console.error("Erro ao listar redações pendentes:", err);
        res.status(500).json({ erro: "Erro ao listar redações pendentes." });
    }
};

exports.corrigirRedacao = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            comp1,
            comp2,
            comp3,
            comp4,
            comp5,
            feedback,
            professor_id
        } = req.body;

        await Professor.corrigirRedacao(
            id,
            { comp1, comp2, comp3, comp4, comp5 },
            feedback,
            professor_id
        );

        res.json({ mensagem: "Redação corrigida com sucesso!" });

    } catch (err) {
        console.error("Erro ao corrigir redação:", err);
        res.status(500).json({ erro: "Erro ao corrigir redação." });
    }
};


