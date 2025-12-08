const pool = require("../../config/db");

class Material {
  constructor(id, materia, tema, titulo, arquivo, criado_por, concluida) {
    this.id = id;
    this.titulo = titulo;
    this.tema = tema;
    this.materia = materia;
    this.arquivo = arquivo;
    this.criado_por = criado_por;
    this.concluida = concluida;
  }

  static fromDB(row) {
    return new Material(
      row.id,
      row.titulo,
      row.tema,
      row.materia,
      row.arquivo,
      row.criado_por,
      row.concluida || 0
    );
  }

  static async listar() {
    try {
      console.log("[Material.listar] Executando SELECT * FROM material");
      const result = await pool.query("SELECT * FROM material");
      const rows = result.rows;
      console.log(`[Material.listar] ${rows.length} registros encontrados`);
      console.table(rows);
      return rows;
    } catch (err) {
      console.error("[Material.listar] Erro SQL:", err);
      throw err;
    }
  }

  static async listarMaterial(materia) {
    try {
      console.log("Listando materiais para: ", materia);
      const result = await pool.query(
        "SELECT id, tema, subtema, materia, titulo, arquivo, criado_por FROM material WHERE materia = $1",
        [materia]
      );
      const rows = result.rows;

      const materiais = rows.map((row) => ({
        id: row.id,
        tema: row.tema,
        subtema: row.subtema,
        materia: row.materia,
        titulo: row.titulo,
        arquivo: row.arquivo,
        criado_por: row.criado_por,
      }));

      return materiais;
    } catch (err) {
      console.error("Erro SQL no listar Material:", err);
      throw err;
    }
  }

  static async atualizarProgresso(idUsuario, atividadeId, concluida) {
    await pool.query(
      `INSERT INTO progresso_atividades (usuario_id, atividade_id, concluida) 
             VALUES ($1, $2, TRUE)
             ON CONFLICT (usuario_id, atividade_id) 
             DO UPDATE SET 
                concluida = TRUE, 
                concluida_em = CURRENT_TIMESTAMP`,
      [idUsuario, atividadeId]
    );
  }

  static async listarProgresso(idUsuario) {
    const result = await pool.query(
      `SELECT p.atividade_id, p.concluida, m.materia
            FROM progresso_atividades p
            LEFT JOIN material m ON p.atividade_id = m.id
            WHERE p.usuario_id=$1`,
      [idUsuario]
    );
    return result.rows;
  }

  static async verPDF(id) {
    const result = await pool.query(
      "SELECT arquivo FROM material WHERE id = $1",
      [id]  
    );
    return result.rows;
  }
}

module.exports = Material;
