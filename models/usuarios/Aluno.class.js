const Usuario = require("./Usuario.class");
const pool = require("../../config/db");

class Aluno extends Usuario {
  constructor(
    usuario_id,
    modoIntensivo = false,
    diagnostico = "",
    planoEstudosId = null,
    ranking = 0,
    xp = 0,
    progresso_percent = 0
  ) {
    super(usuario_id);
    this.usuario_id = usuario_id;
    this.modoIntensivo = modoIntensivo;
    this.diagnostico = diagnostico;
    this.planoEstudosId = planoEstudosId;
    this.ranking = ranking;
    this.xp = xp;
    this.progresso_percent = progresso_percent;
  }

  // Listar todos os alunos (Mantido)
  static async listar() {
    const result = await pool.query("SELECT * FROM alunos");
    return result.rows;
  }

  // Cadastrar novo aluno - CORRIGIDO PARA RECEBER E USAR A CONEXÃO DEDICADA
  static async cadastrar(usuario_id, modoIntensivo = false, connection = pool) {
    // <--- ADICIONADO 'connection'
    try {
      // AGORA USA O PARÂMETRO 'connection' (que será o 'client' na transação)
      await connection.query(
        `INSERT INTO alunos 
                (usuario_id, modoIntensivo, ranking, xp, progresso_percent) 
                VALUES ($1, $2, 0, 0, 0)`,
        [usuario_id, modoIntensivo]
      );
      return usuario_id;
    } catch (err) {
      console.error("Erro ao cadastrar aluno:", err.message);
      throw new Error("Erro ao cadastrar aluno: " + err.message);
    }
  }

  // ... (restante dos métodos inalterados, pois já usavam o pool global e não estavam na transação)

  static async editar(usuario_id, dados) {
    const { modoIntensivo, ranking, xp, progresso_percent } = dados;
    await pool.query(
      `UPDATE alunos 
            SET modoIntensivo = $1, ranking = $2, xp = $3, progresso_percent = $4 
            WHERE usuario_id = $5`,
      [modoIntensivo, ranking, xp, progresso_percent, usuario_id]
    );
    return true;
  }

  static async deletar(usuario_id) {
    await pool.query("DELETE FROM alunos WHERE usuario_id = $1", [usuario_id]);
    return true;
  }

  static async buscarPorId(usuario_id) {
    const result = await pool.query(
      "SELECT * FROM alunos WHERE usuario_id = $1",
      [usuario_id]
    );
    return result.rows[0] || null;
  }

  static async ativarModoIntensivo(usuario_id, modoIntensivo = true) {
    await pool.query(
      "UPDATE alunos SET modoIntensivo = $1 WHERE usuario_id = $2",
      [modoIntensivo, usuario_id]
    );
    return true;
  }

  static async checkRanking(usuario_id) {
    const result = await pool.query(
      "SELECT ranking, xp FROM alunos WHERE usuario_id = $1",
      [usuario_id]
    );
    return result.rows[0] || null;
  }

  static async addXp(usuario_id, xp) {
    try {
      await pool.query("UPDATE alunos SET xp = xp + $1 WHERE usuario_id = $2", [
        xp,
        usuario_id,
      ]);

      const result = await pool.query(
        "SELECT xp FROM alunos WHERE usuario_id = $1",
        [usuario_id]
      );

      return result.rows[0];
    } catch (err) {
      console.error("Erro ao adicionar XP:", err);
      throw new Error("Erro interno ao adicionar XP.");
    }
  }
  static async listarRankingGeral() {
    const query = `
        SELECT
            a.usuario_id AS id, 
            u.nome, 
            a.xp,
            u.fotos_url
        FROM
            alunos a
        JOIN
            usuarios u ON a.usuario_id = u.id 
        ORDER BY
            a.xp DESC,   -- ORDENA APENAS PELO XP (DO MAIOR PARA O MENOR)
            u.nome ASC;  -- Critério de desempate
    `;

    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error("Erro ao buscar ranking no DB:", error);

      throw new Error("Erro no banco de dados ao buscar o ranking.");
    }
  }

  static async atualizarUrlFoto(usuario_id, url_foto) {
    try {
      // A TABELA CORRETA É 'usuarios', não 'alunos', pois a coluna de foto está lá.
      const sql = `
                UPDATE usuarios 
                SET fotos_url = $1 
                WHERE id = $2
            `;
      await pool.query(sql, [url_foto, usuario_id]);
      return true;
    } catch (err) {
      console.error("Erro ao atualizar URL da foto:", err);
      throw new Error("Erro interno ao atualizar URL da foto.");
    }
  }
}

module.exports = Aluno;
