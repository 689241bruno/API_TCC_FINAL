const Redacao = require("../models/objetos/Redacao.class");

exports.salvar = async (req, res) => {
    try {
        const { aluno_id, tema, titulo, texto, competencias, resultado_ia, feedback } = req.body;

        if (!resultado_ia || !aluno_id) {
            return res.status(400).json({ erro: "Dados incompletos para salvar a correção." });
        }

        const getNotaCompetencia = (idComp) => {
            const comp = competencias.find(c => c.id === idComp);
            return comp ? comp.nota : 0;
        };

        const dataPrepare = {
            aluno_id,
            titulo: titulo || "Redação sem título",
            tema: tema || "Tema Livre",
            texto,
            comp1: getNotaCompetencia(1),
            comp2: getNotaCompetencia(2),
            comp3: getNotaCompetencia(3),
            comp4: getNotaCompetencia(4),
            comp5: getNotaCompetencia(5),
            nota_ia: resultado_ia,
            feedback: feedback
        };

        const novaRedacao = await Redacao.saveRedacao(dataPrepare);

        res.status(201).json({
            mensagem: "Redação corrigida e salva com sucesso!",
            ...novaRedacao
        });

    } catch (err) {
        console.error("Erro ao salvar correção da redação:", err);
        res.status(500).json({ erro: "Erro interno ao processar a correção." });
    }
};

exports.getRedacaoByAlunoID = async (req, res) => {
    try {
        const { id } = req.params;
        const redacoes = await Redacao.getRedacaoByAlunoID(id);
        res.json(redacoes);
    } catch (err) {
        console.error("Erro ao listar histórico: ", err);
        res.status(500).json({ erro: "Erro ao buscar histórico de redações de aluno." });
    }
};

exports.getRedacaoByID = async (req, res) => {
    try {
        const id = req.params;
        const redacao = await Redacao.getRedacaoByID(id)
        res.json(redacao)
    } catch (err) {
        console.error("Error listando redações: ", err)
        res.status(500).json({erro: "Erro buscando redação especifica"})
    }
};

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