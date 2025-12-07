const pool = require("../../config/db");

class Redacao {
  constructor(
    id,
    aluno_id,
    titulo,
    tema,
    texto,
    tempo,
    data,
    comp1 = 0,
    comp2 = 0,
    comp3 = 0,
    comp4 = 0,
    comp5 = 0,
    notaIA = null,
    notaProfessor = null,
    feedback = "",
    corrigidaPorProfessor = false,
    corrigida = false,
    titulo_texto1 = "",
    titulo_texto2 = "",
    titulo_texto3 = "",
    titulo_texto4 = "",
    texto1 = "",
    texto2 = "",
    texto3 = "",
    texto4 = "",
    img1,
    img2,
    img3,
    img4
  ) {
    this.id = id;
    this.aluno_id = aluno_id;
    this.titulo = titulo;
    this.tema = tema;
    this.texto = texto;
    this.tempo = tempo;
    this.data = data;
    this.comp1 = comp1;
    this.comp2 = comp2;
    this.comp3 = comp3;
    this.comp4 = comp4;
    this.comp5 = comp5;
    this.notaIA = notaIA;
    this.notaProfessor = notaProfessor;
    this.feedback = feedback;
    this.corrigidaPorProfessor = corrigidaPorProfessor;
    this.corrigida = corrigida;
    this.titulo_texto1 = titulo_texto1;
    this.titulo_texto2 = titulo_texto2;
    this.titulo_texto3 = titulo_texto3;
    this.titulo_texto4 = titulo_texto4;
    this.texto1 = texto1;
    this.texto2 = texto2;
    this.texto3 = texto3;
    this.texto4 = texto4;
    this.img1 = img1;
    this.img2 = img2;
    this.img3 = img3;
    this.img4 = img4;
  }

  static async getRedacaoByAlunoID(alunoId) {
    const resultadoQuery = await pool.query(
      "SELECT * FROM redacoes WHERE aluno_id = $1 ORDER BY data DESC",
      [alunoId]
    );
    return resultadoQuery.rows;
  }

  static async getRedacaoByID(id) {
    const [rows] = await pool.query("SELECT * FROM redacoes WHERE id = ?", [
      id,
    ]);
    return rows;
  }

  static async saveRedacao(dados) {
    try {
      console.log("Recebido no backend:", dados);

      const {
        aluno_id,
        tema,
        titulo,
        texto,
        comp1 = 0,
        comp2 = 0,
        comp3 = 0,
        comp4 = 0,
        comp5 = 0,
        nota_ia = null,
        feedback = "",
      } = dados;

      const dataAtual = new Date().toISOString().slice(0, 10);

      const [result] = await pool.query(
        `INSERT INTO redacoes 
        (aluno_id, tema, titulo, texto, data, comp1, comp2, comp3, comp4, comp5, nota_ia, feedback, corrigida)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          aluno_id,
          tema,
          titulo,
          texto,
          dataAtual,
          comp1,
          comp2,
          comp3,
          comp4,
          comp5,
          nota_ia,
          feedback,
        ]
      );

      return { id: result.insertId, ...dados, data: dataAtual };
    } catch (error) {
      console.error("ERRO NO saveRedacao:", error);
      throw error;
    }
  }

  static async listarRedacoesID(aluno_id) {
    const result = await pool.query(
      "SELECT * FROM redacoes WHERE aluno_id = $1",
      [aluno_id]
    );
    return result.rows;
  }

  static async listarTemas() {
    const result = await pool.query("SELECT * FROM tema_redacao");
    return result.rows;
  }

  static async buscarPorId(id) {
    const result = await pool.query(
      "SELECT * FROM tema_redacao WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  }

  static async adicionar(dados) {
    const {
      tema,
      ano,
      titulo_texto1,
      titulo_texto2,
      titulo_texto3,
      titulo_texto4,
      texto1,
      texto2,
      texto3,
      texto4,
      img1,
      img2,
      img3,
      img4,
    } = dados;

    const result = await pool.query(
      `INSERT INTO tema_redacao
            (tema, ano, titulo_texto1, titulo_texto2, titulo_texto3, titulo_texto4,
            texto1, texto2, texto3, texto4, img1, img2, img3, img4)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
             RETURNING id`,
      [
        tema,
        ano,
        titulo_texto1,
        titulo_texto2,
        titulo_texto3,
        titulo_texto4,
        texto1,
        texto2,
        texto3,
        texto4,
        img1,
        img2,
        img3,
        img4,
      ]
    );

    return { id: result.rows[0].id, ...dados };
  }

  static async editarTema(id, dados) {
    const result = await pool.query(
      `UPDATE tema_redacao SET
                tema = $1, ano = $2,
                titulo_texto1 = $3, titulo_texto2 = $4, titulo_texto3 = $5, titulo_texto4 = $6,
                texto1 = $7, texto2 = $8, texto3 = $9, texto4 = $10,
                img1 = $11, img2 = $12, img3 = $13, img4 = $14
            WHERE id = $15`,
      [
        dados.tema,
        dados.ano,
        dados.titulo_texto1,
        dados.titulo_texto2,
        dados.titulo_texto3,
        dados.titulo_texto4,
        dados.texto1,
        dados.texto2,
        dados.texto3,
        dados.texto4,
        dados.img1,
        dados.img2,
        dados.img3,
        dados.img4,
        id,
      ]
    );

    return result.rowCount > 0;
  }

  static async deletarTema(id) {
    const result = await pool.query("DELETE FROM tema_redacao WHERE id = $1", [
      id,
    ]);
    return result.rowCount > 0;
  }
}

module.exports = Redacao;
