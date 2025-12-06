const pool = require("../../config/db");

class Questao {
  constructor(id, titulo, enunciado, ano, prova, materia, tema, alternativas) {
    this.id = id;
    this.titulo = titulo;
    this.enunciado = enunciado;
    this.ano = ano;
    this.prova = prova;
    this.materia = materia;
    this.tema = tema;
    this.alternativas = alternativas;
  }

  static async listar() {
    const result = await pool.query(`
            SELECT 
                q.*,
                a.*
            FROM questoes q
            LEFT JOIN alternativas a ON a.questao_id = q.id
            ORDER BY q.id DESC
        `);
    const rows = result.rows;

    return rows.map((r) => ({
      id: r.id,
      titulo: r.titulo,
      enunciado: r.enunciado,
      ano: r.ano,
      prova: r.prova,
      materia: r.materia,
      tema: r.tema,
      alternativas: [
        { letra: r.letra1, texto: r.texto1, correta: r.correta == 1 },
        { letra: r.letra2, texto: r.texto2, correta: r.correta == 2 },
        { letra: r.letra3, texto: r.texto3, correta: r.correta == 3 },
        { letra: r.letra4, texto: r.texto4, correta: r.correta == 4 },
        { letra: r.letra5, texto: r.texto5, correta: r.correta == 5 },
      ],
    }));
  }

  static async buscarPorId(id) {
    const result = await pool.query(
      `
            SELECT 
                q.*,
                a.*
            FROM questoes q
            LEFT JOIN alternativas a ON a.questao_id = q.id
            WHERE q.id = $1
        `,
      [id]
    );
    const rows = result.rows;

    if (!rows.length) return null;
    const r = rows[0];

    return {
      id: r.id,
      titulo: r.titulo,
      enunciado: r.enunciado,
      ano: r.ano,
      prova: r.prova,
      materia: r.materia,
      tema: r.tema,
      alternativas: [
        { letra: r.letra1, texto: r.texto1, correta: r.correta == 1 },
        { letra: r.letra2, texto: r.texto2, correta: r.correta == 2 },
        { letra: r.letra3, texto: r.texto3, correta: r.correta == 3 },
        { letra: r.letra4, texto: r.texto4, correta: r.correta == 4 },
        { letra: r.letra5, texto: r.texto5, correta: r.correta == 5 },
      ],
    };
  }

  static async criar({
    titulo,
    enunciado,
    ano,
    prova,
    materia,
    tema,
    alternativas,
  }) {
    // No pg, usamos pool.connect() para transações (equivalente a getConnection)
    const client = await pool.connect();
    try {
      await client.query("BEGIN"); // Inicia a transação (equivalente a beginTransaction)

      const insertQuestaoResult = await client.query(
        `
                INSERT INTO questoes (titulo, enunciado, ano, prova, materia, tema)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id
            `,
        [titulo, enunciado, ano, prova, materia, tema]
      );

      const questaoId = insertQuestaoResult.rows[0].id; // Captura o ID inserido

      const alternativa = {
        letra1: alternativas[0].letra,
        texto1: alternativas[0].texto,
        letra2: alternativas[1].letra,
        texto2: alternativas[1].texto,
        letra3: alternativas[2].letra,
        texto3: alternativas[2].texto,
        letra4: alternativas[3].letra,
        texto4: alternativas[3].texto,
        letra5: alternativas[4].letra,
        texto5: alternativas[4].texto,
        correta: alternativas.findIndex((a) => a.correta) + 1,
      };

      await client.query(
        `
                INSERT INTO alternativas (
                    letra1, texto1,
                    letra2, texto2,
                    letra3, texto3,
                    letra4, texto4,
                    letra5, texto5,
                    correta, questao_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            `,
        [
          alternativa.letra1,
          alternativa.texto1,
          alternativa.letra2,
          alternativa.texto2,
          alternativa.letra3,
          alternativa.texto3,
          alternativa.letra4,
          alternativa.texto4,
          alternativa.letra5,
          alternativa.texto5,
          alternativa.correta,
          questaoId,
        ]
      );

      await client.query("COMMIT"); // Finaliza a transação (equivalente a commit)
      return questaoId;
    } catch (err) {
      await client.query("ROLLBACK"); // Desfaz a transação (equivalente a rollback)
      throw err;
    } finally {
      client.release(); // Libera a conexão
    }
  }

  static async editar(id, dados) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const { titulo, enunciado, ano, prova, materia, tema, alternativas } =
        dados;

      await client.query(
        `
                UPDATE questoes
                SET titulo=$1, enunciado=$2, ano=$3, prova=$4, materia=$5, tema=$6
                WHERE id=$7
            `,
        [titulo, enunciado, ano, prova, materia, tema, id]
      );

      const correta = alternativas.findIndex((a) => a.correta) + 1;

      await client.query(
        `
                UPDATE alternativas SET
                    letra1=$1, texto1=$2,
                    letra2=$3, texto2=$4,
                    letra3=$5, texto5=$6,
                    letra4=$7, texto4=$8,
                    letra5=$9, texto5=$10,
                    correta=$11
                WHERE questao_id=$12
            `,
        [
          alternativas[0].letra,
          alternativas[0].texto,
          alternativas[1].letra,
          alternativas[1].texto,
          alternativas[2].letra,
          alternativas[2].texto,
          alternativas[3].letra,
          alternativas[3].texto,
          alternativas[4].letra,
          alternativas[4].texto,
          correta,
          id,
        ]
      );

      await client.query("COMMIT");
      return true;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  static async deletar(id) {
    // A foreign key com ON DELETE CASCADE deve deletar as alternativas automaticamente
    await pool.query("DELETE FROM questoes WHERE id=$1", [id]);
    return true;
  }

  static async sortear(materia, tema, quantidade = 10) {
    // Usando RANDOM() do PostgreSQL em vez de RAND() do MySQL
    const result = await pool.query(
      `
            SELECT id FROM questoes
            WHERE materia ILIKE $1 AND tema ILIKE $2
            ORDER BY RANDOM()
            LIMIT $3
        `,
      [`%${materia}%`, `%${tema}%`, quantidade]
    ); // ILIKE é case-insensitive no Postgres

    return result.rows.map((r) => r.id);
  }

  static async verificarRespostas(respostasUsuario) {
    const resultado = [];

    for (const r of respostasUsuario) {
      const result = await pool.query(
        `
                SELECT correta FROM alternativas
                WHERE questao_id = $1
            `,
        [r.questaoId]
      );
      const rows = result.rows;

      const correta = rows[0]?.correta;

      resultado.push({
        questaoId: r.questaoId,
        usuario: r.respostaUsuario,
        correta,
        acertou: Number(r.respostaUsuario) === Number(correta),
      });
    }

    return resultado;
  }
}

module.exports = Questao;
