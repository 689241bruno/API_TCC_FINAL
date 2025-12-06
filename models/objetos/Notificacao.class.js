const pool = require("../../config/db");

class Notificacao {
  constructor(id, usuario_id, titulo = "", mensagem = "", tipo = "") {
    this.id = id;
    this.usuario_id = usuario_id;
    this.titulo = titulo;
    this.mensagem = mensagem;
    this.tipo = tipo;
  }

  static async listar() {
    const result = await pool.query(
      "SELECT * FROM notificacoes ORDER BY id DESC"
    );
    return result.rows;
  }

  static async criar(data) {
    const { titulo, mensagem, tipo } = data;

    const result = await pool.query(
      "INSERT INTO notificacoes (titulo, mensagem, tipo) VALUES ($1, $2, $3) RETURNING id",
      [titulo, mensagem, tipo]
    );

    return { id: result.rows[0].id, ...data };
  }

  static async editar(id, data) {
    const { titulo, mensagem, tipo } = data;

    await pool.query(
      "UPDATE notificacoes SET titulo = $1, mensagem = $2, tipo = $3 WHERE id = $4",
      [titulo, mensagem, tipo, id]
    );

    return { id, ...data };
  }

  static async deletar(id) {
    await pool.query("DELETE FROM notificacoes WHERE id = $1", [id]);
    return true;
  }
}

module.exports = Notificacao;
