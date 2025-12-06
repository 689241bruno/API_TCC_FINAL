const pool = require("../../config/db");

class Faq {
  constructor(id, usuario_id, pergunta, resposta, respondida, pergunta_freq) {
    this.id = id;
    this.usuario_id = usuario_id;
    this.pergunta = pergunta;
    this.resposta = resposta;
    this.respondida = respondida;
    this.pergunta_freq = pergunta_freq;
  }

  static async criarPergunta(usuario_id, pergunta) {
    const result = await pool.query(
      `INSERT INTO faq (usuario_id, pergunta, respondida, pergunta_freq)
             VALUES ($1, $2, FALSE, FALSE) RETURNING id`,
      [usuario_id, pergunta]
    );

    return { id: result.rows[0].id, usuario_id, pergunta };
  }

  static async responder(id, resposta) {
    await pool.query(
      `UPDATE faq SET resposta = $1, respondida = TRUE WHERE id = $2`,
      [resposta, id]
    );
    return true;
  }

  static async listarPublico() {
    const result = await pool.query(
      `SELECT id, pergunta, resposta FROM faq WHERE respondida = TRUE AND pergunta_freq = TRUE ORDER BY id DESC`
    );
    return result.rows;
  }

  static async listarAdmin() {
    const result = await pool.query(`SELECT * FROM faq ORDER BY id DESC`);
    return result.rows;
  }

  static async marcarFrequente(id, valor) {
    await pool.query(`UPDATE faq SET pergunta_freq = $1 WHERE id = $2`, [
      valor,
      id,
    ]);
    return true;
  }
}

module.exports = Faq;
