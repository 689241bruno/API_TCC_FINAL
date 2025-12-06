const pool = require("../../config/db");

class Flashcard {
  constructor(
    id,
    usuario_id,
    pergunta,
    resposta,
    materia,
    ultimaRevisao = new Date(),
    proximaRevisao = null,
    repeticoes = 4
  ) {
    this.id = id;
    this.usuario_id = usuario_id;
    this.pergunta = pergunta;
    this.resposta = resposta;
    this.materia = materia;
    this.ultimaRevisao = ultimaRevisao;
    this.proximaRevisao = proximaRevisao;
    this.repeticoes = repeticoes;
  }

  static async listar(usuario_id) {
    const result = await pool.query(
      "SELECT * FROM flashcards WHERE usuario_id = $1",
      [usuario_id]
    );
    return result.rows;
  }

  static async criar(usuario_id, pergunta, resposta, materia, repeticoes = 4) {
    try {
      const ultimaRevisao = new Date();
      const proximaRevisao = null;

      const result = await pool.query(
        `INSERT INTO flashcards 
                 (usuario_id, pergunta, resposta, materia, ultima_revisao, proxima_revisao, repeticoes)
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [
          usuario_id,
          pergunta,
          resposta,
          materia,
          ultimaRevisao,
          proximaRevisao,
          repeticoes,
        ]
      );

      return result.rows[0].id;
    } catch (err) {
      console.error("Erro ao criar Flashcard: ", err.message);
      throw new Error("Erro ao criar Flashcard.");
    }
  }

  static async editar(id, dados) {
    const { pergunta, resposta, materia, proximaRevisao, repeticoes } = dados;
    await pool.query(
      `UPDATE flashcards 
             SET pergunta = $1, resposta = $2, materia = $3, proxima_revisao = $4, repeticoes = $5
             WHERE id = $6`,
      [pergunta, resposta, materia, proximaRevisao, repeticoes, id]
    );
    return true;
  }

  static async deletar(id) {
    await pool.query("DELETE FROM flashcards WHERE id = $1", [id]);
    return true;
  }

  static async revisar(id) {
    try {
      const result = await pool.query(
        "SELECT repeticoes FROM flashcards WHERE id = $1",
        [id]
      );
      const flashcards = result.rows;

      if (flashcards.length === 0) {
        throw new new Error("Flashcard não encontrado!")();
      }

      const flashcard = flashcards[0];
      const repeticoes = flashcard.repeticoes || 4;

      const diasEntreRevisoes = Math.floor(30 / repeticoes);
      const agora = new Date();
      const proximaRevisao = new Date();
      proximaRevisao.setDate(agora.getDate() + diasEntreRevisoes);

      await pool.query(
        `UPDATE flashcards
                 SET ultima_revisao = $1, proxima_revisao = $2
                 WHERE id = $3`,
        [agora, proximaRevisao, id]
      );

      return { proximaRevisao, diasEntreRevisoes };
    } catch (err) {
      console.error("Erro ao revisar flashcard: ", err.message);
      throw new Error("Erro ao revisar flashcard.");
    }
  }
}

module.exports = Flashcard;
