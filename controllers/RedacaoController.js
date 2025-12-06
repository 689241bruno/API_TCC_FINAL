const Redacao = require("../models/objetos/Redacao.class");

exports.listarRedacoes = async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const redacoes = await Redacao.listarRedacoesID(usuario_id);
        res.json({ data: redacoes });   
    } catch (err) {
        console.error("Erro ao listar redaçõess:", err);
        res.status(500).json({ erro: "Erro ao listar redações!" });
    }
};

exports.listarTemas = async (req, res) => {
    try {
        const temas = await Redacao.listarTemas();
        res.json({ data: temas });   
    } catch (err) {
        console.error("Erro ao listar temas:", err);
        res.status(500).json({ erro: "Erro ao listar temas!" });
    }
};

exports.buscarTema = async (req, res) => {
    try {
        const { id } = req.params;
        const tema = await Redacao.buscarPorId(id);

        if (!tema)
            return res.status(404).json({ erro: "Tema não encontrado!" });

        res.json(tema);
    } catch (err) {
        console.error("Erro ao buscar tema:", err);
        res.status(500).json({ erro: "Erro ao buscar tema!" });
    }
};

exports.adicionarTema = async (req, res) => {
    try {
        const dados = req.body;

        // Convertendo imagens base64 → buffer
        const imagens = ["img1", "img2", "img3", "img4"];
        imagens.forEach((campo) => {
            if (dados[campo] && dados[campo].startsWith("data:image")) {
                const base64Data = dados[campo].split(",")[1];
                dados[campo] = Buffer.from(base64Data, "base64");
            } else {
                dados[campo] = null;
            }
        });

        const novoTema = await Redacao.adicionar(dados);
        res.status(201).json(novoTema);

    } catch (err) {
        console.error("Erro ao criar tema:", err);
        res.status(500).json({ erro: "Erro ao criar tema!" });
    }
};

exports.editarTema = async (req, res) => {
    try {
        const { id } = req.params;
        const dados = req.body;

        // converter base64 para buffer
        const imagens = ["img1", "img2", "img3", "img4"];
        imagens.forEach((campo) => {
            if (dados[campo] && dados[campo].startsWith("data:image")) {
                const base64Data = dados[campo].split(",")[1];
                dados[campo] = Buffer.from(base64Data, "base64");
            }
        });

        const atualizado = await Redacao.editarTema(id, dados);

        if (!atualizado)
            return res.status(404).json({ erro: "Tema não encontrado!" });

        res.json({ mensagem: "Tema atualizado com sucesso!" });
    } catch (err) {
        console.error("Erro ao editar tema:", err);
        res.status(500).json({ erro: "Erro ao editar tema!" });
    }
};

exports.deletarTema = async (req, res) => {
    try {
        const { id } = req.params;

        const deletado = await Redacao.deletarTema(id);

        if (!deletado)
            return res.status(404).json({ erro: "Tema não encontrado!" });

        res.json({ mensagem: "Tema deletado com sucesso!" });
    } catch (err) {
        console.error("Erro ao deletar tema:", err);
        res.status(500).json({ erro: "Erro ao deletar tema!" });
    }
};