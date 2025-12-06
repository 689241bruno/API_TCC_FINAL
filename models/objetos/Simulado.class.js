const pool = require("../../config/db");
const Questao = require("./Questao.class");

class Simulado {
  constructor(
    id,
    feito_por,
    data,
    tempo,
    pontuacao,
    linguagens,
    exatas,
    ciencias_hum,
    ciencias_nat
  ) {
    this.id = id;
    this.feito_por = feito_por;
    this.data = data;
    this.tempo = tempo;
    this.pontuacao = pontuacao;
    this.linguagens = linguagens;
    this.exatas = exatas;
    this.ciencias_hum = ciencias_hum;
    this.ciencias_nat = ciencias_nat;
  }

  static async listarPorUsuario(id) {
    const result = await pool.query(
      "SELECT * FROM simulados WHERE feito_por = $1 ORDER BY data DESC",
      [id]
    );
    return result.rows;
  }

  static async gerarSimulado(quantidade = 20, materia = null, tema = "") {
    const ids = await Questao.sortear(materia || "", tema || "", quantidade);

    if (!ids.length) return [];

    const questoes = [];
    for (const id of ids) {
      const q = await Questao.buscarPorId(id);
      if (q) questoes.push(q);
    }

    return questoes;
  }

  static async salvarResultado({
    feito_por,
    tempo,
    pontuacao,
    linguagens,
    exatas,
    ciencias_hum,
    ciencias_nat,
    quantidade_questoes,
  }) {
    const data = new Date();

    const result = await pool.query(
      `INSERT INTO simulados 
            (feito_por, data, tempo, pontuacao, linguagens, exatas, ciencias_hum, ciencias_nat, quantidade_questoes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id`,
      [
        feito_por,
        data,
        tempo,
        pontuacao,
        linguagens,
        exatas,
        ciencias_hum,
        ciencias_nat,
        quantidade_questoes,
      ]
    );

    return result.rows[0].id;
  }

  static async corrigir(respostasAluno) {
    let acertos = 0;

    respostasAluno.forEach((resp) => {
      const escolhida = resp.escolhida
        ? String(resp.escolhida).trim().toUpperCase()
        : "";
      const correta = resp.correta
        ? String(resp.correta).trim().toUpperCase()
        : "";

      if (escolhida && correta && escolhida === correta) acertos++;
    });

    const pontuacao = respostasAluno.length > 0 ? (acertos / 10) * 10 : 0;

    return {
      acertos,
      total: respostasAluno.length,
      pontuacao,
    };
  }

  static async deletar(id) {
    await pool.query("DELETE FROM simulados WHERE id = $1", [id]);
    return true;
  }
}

module.exports = Simulado;
