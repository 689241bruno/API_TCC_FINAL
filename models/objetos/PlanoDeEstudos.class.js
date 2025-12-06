const pool = require("../../config/db");

class PlanoDeEstudos {
  constructor(id, usuario_id, dia, materia, tema, inicio, termino) {
    this.id = id;
    this.usuario_id = usuario_id;
    this.dia = dia;
    this.materia = materia;
    this.tema = tema;
    this.inicio = inicio;
    this.termino = termino;
  }

  static async listar(usuario_id) {
    const result = await pool.query(
      "SELECT * FROM plano_estudos WHERE usuario_id = $1",
      [usuario_id]
    );
    return result.rows;
  }

  static async criar({ usuario_id, dia, materia, tema, inicio, termino }) {
    const result = await pool.query(
      `INSERT INTO plano_estudos (usuario_id, dia, materia, tema, inicio, termino)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [usuario_id, dia, materia, tema, inicio, termino]
    );
    return result.rows[0].id;
  }

  static async editar(id, dados) {
    const { dia, materia, tema, inicio, termino } = dados;
    await pool.query(
      `UPDATE plano_estudos 
            SET dia = $1, materia = $2, tema = $3, inicio = $4, termino = $5
            WHERE id = $6`,
      [dia, materia, tema, inicio, termino, id]
    );
    return true;
  }

  static async deletar(id) {
    await pool.query("DELETE FROM plano_estudos WHERE id = $1", [id]);
    return true;
  }
}

module.exports = PlanoDeEstudos;
