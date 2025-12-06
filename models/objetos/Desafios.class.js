const pool = require("../../config/db");

class Desafios {
  constructor(id, titulo, descricao, materia, quantidade, xp, img) {
    this.id = id;
    this.titulo = titulo;
    this.descricao = descricao;
    this.materia = materia;
    this.quantidade = quantidade;
    this.xp = xp;
    this.img = img;
  }

  static async listar() {
    const result = await pool.query("SELECT * FROM desafios");
    const rows = result.rows;

    const desafiosComBase64 = rows.map((d) => ({
      ...d,

      img: d.img ? `data:image/png;base64,${d.img.toString("base64")}` : null,
    }));

    return desafiosComBase64;
  }

  static async listarConquistas(usuario_id) {
    console.log("Buscando conquistas do usuário:", usuario_id);

    const result = await pool.query(
      `SELECT d.*, pd.concluida_em
            FROM progresso_desafios pd
            INNER JOIN desafios d ON d.id = pd.desafio_id
            WHERE pd.usuario_id = $1 AND pd.concluida = TRUE
            ORDER BY pd.concluida_em DESC`,
      [usuario_id]
    );
    const rows = result.rows;

    console.log("Conquistas encontradas:", rows);

    const conquistas = rows.map((d) => ({
      ...d,
      img: d.img ? `data:image/png;base64,${d.img.toString("base64")}` : null,
    }));

    return conquistas;
  }

  static async criar({ titulo, descricao, materia, quantidade, xp, img }) {
    const result = await pool.query(
      "INSERT INTO desafios (titulo, descricao, materia, quantidade, xp, img) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      [titulo, descricao, materia, quantidade, xp, img]
    );

    return result.rows[0].id;
  }

  static async editar(id, dados) {
    const titulo = dados.titulo;
    const descricao = dados.descricao;
    const materia = dados.materia ?? null;
    const quantidade = dados.quantidade ?? null;
    const xp = dados.xp;
    const img = dados.img ?? null;

    await pool.query(
      "UPDATE desafios SET titulo = $1, descricao = $2, materia = $3, quantidade = $4, xp = $5, img = $6 WHERE id = $7",
      [titulo, descricao, materia, quantidade, xp, img, id]
    );
    return true;
  }

  static async deletar(id) {
    await pool.query("DELETE FROM desafios WHERE id = $1", [id]);
    return true;
  }

  static async listarPorMateria(materia) {
    const result = await pool.query(
      "SELECT * FROM desafios WHERE materia = $1",
      [materia]
    );

    return result.rows;
  }

  static async incrementarProgresso(usuario_id, desafio_id) {
    const result = await pool.query(
      `SELECT d.quantidade,
                    COALESCE(pd.progresso, 0) AS "progressoAtual",
                    COALESCE(pd.concluida, 0) AS concluida
            FROM desafios d
            LEFT JOIN progresso_desafios pd
            ON pd.desafio_id = d.id AND pd.usuario_id = $1
            WHERE d.id = $2`,
      [usuario_id, desafio_id]
    );

    const row = result.rows[0];

    if (!row) return false;

    if (row.concluida === 1) return false;

    const novoProgresso = row.progressoAtual + 1;
    const quantidade = row.quantidade;

    const concluiu = novoProgresso >= quantidade ? true : false;

    try {
      if (row.progressoAtual > 0) {
        await pool.query(
          `UPDATE progresso_desafios
                    SET progresso = $1, concluida = $2, concluida_em = CURRENT_TIMESTAMP
                    WHERE usuario_id = $3 AND desafio_id = $4`,
          [novoProgresso, concluiu, usuario_id, desafio_id]
        );
      } else {
        await pool.query(
          `INSERT INTO progresso_desafios 
                    (usuario_id, desafio_id, progresso, concluida)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (usuario_id, desafio_id) 
                    DO UPDATE SET 
                        progresso = LEAST(progresso + 1, $5),
                        concluida = CASE WHEN LEAST(progresso + 1, $5) >= $5 THEN TRUE ELSE progresso_desafios.concluida END,
                        concluida_em = CASE WHEN LEAST(progresso + 1, $5) >= $5 THEN CURRENT_TIMESTAMP ELSE progresso_desafios.concluida_em END
                    `,
          [usuario_id, desafio_id, novoProgresso, concluiu, quantidade]
        );
      }

      return true;
    } catch (err) {
      console.error("[Desafios.incrementarProgresso] Erro SQL:", err);

      throw err;
    }
  }

  static async registrarProgresso(
    usuario_id,
    desafio_id,
    progresso,
    concluida
  ) {
    await pool.query(
      `INSERT INTO progresso_desafios 
            (usuario_id, desafio_id, progresso, concluida, concluida_em) 
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
            ON CONFLICT (usuario_id, desafio_id) 
            DO UPDATE SET 
                progresso = $3, 
                concluida = $4,
                concluida_em = CURRENT_TIMESTAMP`,
      [usuario_id, desafio_id, progresso, concluida]
    );

    return true;
  }

  static async listarProgresso(usuario_id) {
    const result = await pool.query(
      `SELECT d.*, pd.progresso, pd.concluida, pd.concluida_em
            FROM desafios d
            LEFT JOIN progresso_desafios pd ON d.id = pd.desafio_id AND pd.usuario_id = $1`,
      [usuario_id]
    );
    return result.rows;
  }

  static async marcarConcluida(usuario_id, desafio_id) {
    const result = await pool.query(
      "UPDATE progresso_desafios SET concluida = TRUE, concluida_em = CURRENT_TIMESTAMP WHERE usuario_id = $1 AND desafio_id = $2",
      [usuario_id, desafio_id]
    );

    return result.rowCount;
  }
}

module.exports = Desafios;
