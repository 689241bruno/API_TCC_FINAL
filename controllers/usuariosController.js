const Usuario = require("../models/usuarios/Usuario.class");
const Aluno = require("../models/usuarios/Aluno.class");
const pool = require("../config/db");
const multer = require("multer"); // 1. Importa o Multer
const { uploadImageToCloudinary } = require("../utils/cloudinaryService"); // 2. Importa o Serviço Cloudinary

// Configuração do Multer para MEMORY STORAGE (Armazena como Buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Lista todos os usuários
exports.listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.listar();
    res.json(usuarios);
  } catch (error) {
    console.error("Erro na listagem: ", error);
    res.status(500).send("Erro ao listar usuários!");
  }
};

// Cria um novo usuário
exports.criarUsuario = async (req, res) => {
  let client;
  try {
    console.log("📦 Dados recebidos do frontend:", req.body);
    const { nome, email, senha, is_aluno, is_professor, is_admin } = req.body;

    client = await pool.connect();
    await client.query("BEGIN");

    const alunoFlag = is_aluno ?? 1;
    const professorFlag = is_professor ?? 0;
    const adminFlag = is_admin ?? 0;

    const usuario = await Usuario.cadastrar(
      nome,
      email,
      senha,
      alunoFlag,
      professorFlag,
      adminFlag,
      client
    );

    const usuario_id = usuario.id;

    if (alunoFlag === 1) {
      await Aluno.cadastrar(usuario_id, false, client);
    }

    await client.query("COMMIT");

    res.status(201).json({
      mensagem: "Usuário criado com sucesso!",
      id: usuario_id,
      nome,
      email,
      is_aluno: alunoFlag,
      is_professor: professorFlag,
      is_admin: adminFlag,
    });
  } catch (err) {
    if (client) {
      await client.query("ROLLBACK");
    }
    console.error("Erro no cadastro do usuário:", err);
    res.status(500).json({ erro: "Erro ao criar usuário!" });
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Login
exports.login = async (req, res) => {
  const { email, senha } = req.body;
  try {
    const usuario = await Usuario.login(email, senha);

    if (!usuario) {
      return res.status(401).json({ erro: "Email ou senha inválidos!" });
    }

    delete usuario.senha;

    res.status(200).json({
      mensagem: "Usuário logado com sucesso!",
      usuario,
    });
  } catch (err) {
    console.error("Erro no login: ", err);
    res.status(500).json({ erro: "Erro no servidor." });
  }
};

// Editar - FINALIZADO PARA CLOUDINARY
exports.editarUsuario = [
  // 1. Middleware Multer: processa o arquivo no campo 'foto' e coloca o Buffer em req.file.buffer
  upload.single("foto"),

  async (req, res) => {
    // Campos de texto vêm de req.body
    const { id, nome, email, cor } = req.body;
    // O arquivo vem de req.file
    const file = req.file;

    try {
      console.log("📦 Dados recebidos para edição:", {
        id,
        nome,
        cor,
        temFoto: !!file,
      });

      let fotoUrl = null;

      // 2. Se um arquivo foi enviado (file.buffer existe), faz o upload
      if (file && file.buffer) {
        // Chama o serviço para enviar o Buffer e retorna a URL
        fotoUrl = await uploadImageToCloudinary(file.buffer);
      }

      // 3. Monta o objeto de atualização
      const dadosParaAtualizar = {
        nome,
        email,
        cor,
        // Se fotoUrl não for null, ela será a nova foto
        foto: fotoUrl,
      };

      // 4. Se havia lógica antiga de foto no body (base64) e não há novo file,
      // a lógica do seu frontend deve parar de enviar a foto no body se usar o multer.
      // A lógica antiga de foto no body FOI REMOVIDA AQUI:

      const usuarioAtualizado = await Usuario.editar(id, dadosParaAtualizar);

      res.json({
        mensagem: "Usuário atualizado com sucesso!",
        usuario: usuarioAtualizado,
      });
    } catch (err) {
      console.error("Erro ao editar usuário:", err);
      res.status(500).json({ erro: "Erro ao editar usuário!" });
    }
  },
];

// Deletar
exports.deletarUsuario = async (req, res) => {
  const { id } = req.body;
  try {
    await Usuario.deletar(id);
    res.json({ mesnagem: "Usuário deletado com sucesso!" });
  } catch (err) {
    console.error("Erro no deletar: ", err);
    res.status(500).json({ erro: "Erro ao deletar usuário! " });
  }
};

// Verificar tipo de usuário
exports.verificarTipo = async (req, res) => {
  const { email } = req.query;

  try {
    const tipo = await Usuario.checkUserType(email);
    if (!tipo) {
      return res
        .status(404)
        .json({ existe: false, erro: "Usuário não encontrado" });
    }

    console.log("Dados retornados de checkUserType:", tipo);

    res.json({
      existe: true,
      id: tipo.id,
      nome: tipo.nome,
      is_professor: tipo.is_professor,
      is_admin: tipo.is_admin,
    });
  } catch (err) {
    console.error("Erro no verificar tipo: ", err);
    res.status(500).json({ erro: "Erro ao verificar tipo de usuário! " });
  }
};

// Verifica se usuário existe
exports.checkUser = async (req, res) => {
  const { email } = req.query;
  try {
    const existe = await Usuario.checkUser(email);
    res.json({ existe });
  } catch (err) {
    console.error("Erro ao checar usuário: ", err);
    res.status(500).json({ erro: "Erro ao verificar usuário!" });
  }
};

// Verifica se email+senha são válidos
exports.checkUserPass = async (req, res) => {
  const { email, senha } = req.body;
  try {
    const valido = await Usuario.checkUserPass(email, senha);
    res.json({ valido });
  } catch (err) {
    console.error("Erro ao verificar usuário e senha: ", err);
    res.status(500).json({ erro: "Erro ao verificar email/senha! " });
  }
};

// Recuperar senha
exports.recuperarSenha = async (req, res) => {
  const { email } = req.body;
  try {
    const existe = await Usuario.checkUser(email);

    if (existe) {
      res.status(200).json({ mensagem: "Código enviado para o email!" });
    } else {
      res.status(404).json({ erro: "Email não encontrado!" });
    }
  } catch (error) {
    console.error("Erro no recuperar senha: ", error);
    res.status(500).json({ erro: "Erro no servidor ao recuperar senha!" });
  }
};

exports.buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.buscarPorId(id);

    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    return res.json(usuario);
  } catch (err) {
    console.error("Erro no controller ao buscar usuário:", err);
    return res.status(500).json({ message: "Erro interno ao buscar usuário." });
  }
};
