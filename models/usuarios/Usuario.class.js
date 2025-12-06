const pool = require("../../config/db");
const bcrypt = require("bcrypt");

class Usuario {
  constructor(
    id,
    nome,
    email,
    senha,
    is_aluno = false,
    is_professor = false,
    is_admin = false,
    foto,
    cor,
    criado_em
  ) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.senha = senha;
    this.is_aluno = is_aluno;
    this.is_professor = is_professor;
    this.is_admin = is_admin;
    this.foto = foto;
    this.cor = cor;
    this.criado_em = criado_em;
  }

  static async listar() {
    const result = await pool.query("SELECT * FROM usuarios");
    return result.rows;
  }

  static async cadastrar(
    nome,
    email,
    senha,
    is_aluno,
    is_professor,
    is_admin,
    connection
  ) {
    try {
      // 🔐 HASH da senha antes de salvar (bcrypt funciona igual)
      const salt = await bcrypt.genSalt(10);
      const senhaHash = await bcrypt.hash(senha, salt);

      // Usa $1, $2, ... e RETURNING id
      const result = await connection.query(
        `INSERT INTO usuarios (nome, email, senha, is_aluno, is_professor, is_admin)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id`,
        [nome, email, senhaHash, is_aluno, is_professor, is_admin]
      );

      const usuario_id = result.rows[0].id; // Captura o ID do RETURNING

      return {
        id: usuario_id,
        nome,
        email,
        is_aluno,
        is_professor,
        is_admin,
      };
    } catch (err) {
      console.error("Erro SQL no cadastrar usuário:", err.message);
      throw new Error("Erro ao cadastrar usuário: " + err.message);
    }
  }

  static async login(email, senha) {
    try {
      const result = await pool.query(
        "SELECT * FROM usuarios WHERE email = $1",
        [email]
      );
      const rows = result.rows;

      if (rows.length === 0) return null;

      const usuario = rows[0];

      // 🔐 Compara senha digitada com hash (bcrypt funciona igual)
      const senhaValida = await bcrypt.compare(senha, usuario.senha);

      if (!senhaValida) return null;

      return usuario;
    } catch (err) {
      console.error("Erro na consulta de login:", err);
      throw err;
    }
  }

  static async editar(id, dados) {
    console.log("Entrou em Usuario.editar com:", id, dados);

    if (!dados || typeof dados !== "object") {
      throw new Error("Parâmetro 'dados' está indefinido ou inválido.");
    }

    try {
      let campos = [];
      let valores = [];
      let placeholderIndex = 1;

      // Transforma campos em placeholders ($N)
      if (dados.nome) {
        campos.push(`nome = $${placeholderIndex++}`);
        valores.push(dados.nome);
      }

      if (dados.email) {
        campos.push(`email = $${placeholderIndex++}`);
        valores.push(dados.email);
      }

      if (dados.senha) {
        // Se a senha for alterada, hash deve ser gerado.
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(dados.senha, salt);

        campos.push(`senha = $${placeholderIndex++}`);
        valores.push(senhaHash);
      }

      if (dados.foto) {
        campos.push(`foto = $${placeholderIndex++}`);
        valores.push(dados.foto); // já é buffer vindo do multer
      }

      if (dados.cor) {
        campos.push(`cor = $${placeholderIndex++}`);
        valores.push(dados.cor);
      }

      if (campos.length === 0) return;

      // Busca o usuário atual antes de atualizar
      const atualResult = await pool.query(
        "SELECT * FROM usuarios WHERE id = $1",
        [id]
      );
      const usuarioAtual = atualResult.rows;

      if (usuarioAtual.length === 0) throw new Error("Usuário não encontrado.");

      const emailAntigo = usuarioAtual[0].email;

      // Verifica se é admin
      const adminResult = await pool.query(
        "SELECT * FROM admin WHERE usuario_email = $1",
        [emailAntigo]
      );
      const ehAdmin = adminResult.rows;

      // Impede alterar email de admin (mas permite editar nome)
      if (ehAdmin.length > 0 && dados.email && dados.email !== emailAntigo) {
        throw new Error(
          "Não é permitido alterar o email de um administrador, pois é chave estrangeira."
        );
      }

      console.log("Dados recebidos para edição:", dados);

      // O ID é o último placeholder
      const sql = `UPDATE usuarios SET ${campos.join(
        ", "
      )} WHERE id = $${placeholderIndex}`;
      valores.push(id);

      await pool.query(sql, valores);
      console.log("Query final:", sql, valores);

      const atualizadoResult = await pool.query(
        "SELECT * FROM usuarios WHERE id = $1",
        [id]
      );
      const user = atualizadoResult.rows[0];

      if (user.foto) {
        const base64 = Buffer.from(user.foto).toString("base64");
        user.foto = `data:image/jpeg;base64,${base64}`;
      }

      return user;
    } catch (err) {
      console.error("Erro ao editar usuário:", err);
      throw err;
    }
  }

  static async deletar(id) {
    await pool.query("DELETE FROM usuarios WHERE id = $1", [id]);
    return true;
  }

  static async checkUserType(email, is_aluno, is_professor, is_admin) {
    const result = await pool.query(
      "SELECT id, is_aluno, is_professor, is_admin FROM usuarios WHERE email = $1",
      [email]
    );
    return result.rows[0] || null;
  }

  static async checkUser(email) {
    const result = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1", // Seleciona apenas o ID, otimizando
      [email]
    );
    return result.rows.length > 0;
  }

  static async buscarPorId(id) {
    try {
      const result = await pool.query("SELECT * FROM usuarios WHERE id = $1", [
        id,
      ]);
      const rows = result.rows;

      if (rows.length === 0) {
        return null;
      }

      const usuario = rows[0];
      return usuario;
    } catch (err) {
      console.error("Erro ao buscar usuário por ID:", err);
      throw new Error("Erro interno ao buscar usuário.");
    }
  }
}

module.exports = Usuario;
