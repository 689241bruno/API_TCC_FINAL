const Usuario = require("./Usuario.class");
const pool = require("../../config/db"); // Presume-se que 'connection' é 'pool'

class Professor extends Usuario {
  constructor(usuario_id, usuario_email, materia = "") {
    super(usuario_id);
    super(usuario_email);
    this.usuario_id = usuario_id;
    this.usuario_email = usuario_email;
    this.materia = materia;
  }

  static async listar() {
    const result = await pool.query("SELECT * FROM professores");
    return result.rows;
  }

  static async cadastrar(usuario_id, materia = null, connection = pool) {
    const result = await connection.query(
      "INSERT INTO professores (usuario_id, materia) VALUES ($1, $2)",
      [usuario_id, materia]
    );
    // Tabela 'professores' usa usuario_id como PK, não SERIAL/AUTO_INCREMENT.
    // Retorna o ID que foi usado.
    return { usuario_id, materia };
  }

  static async editar(usuario_id, materia) {
    await pool.query(
      "UPDATE professores SET materia = $1 WHERE usuario_id = $2",
      [materia, usuario_id]
    );
    return true;
  }

  static async deletar(usuario_id) {
    await pool.query("DELETE FROM professores WHERE usuario_id = $1", [
      usuario_id,
    ]);
    return true;
  }

  static async publicarMaterial(
    tema,
    subtema,
    titulo,
    materia,
    arquivo,
    criado_por
  ) {
    // Usa RETURNING id para capturar o ID gerado (coluna SERIAL)
    const result = await pool.query(
      "INSERT INTO material ( tema, subtema, materia, titulo, arquivo, criado_por) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      [tema, subtema, materia, titulo, arquivo, criado_por]
    );
    return result.rows[0]; // Retorna o ID e possivelmente outros campos
  }

  static async editarMaterial(idMaterial, dados) {
    const { titulo, materia, tema, subtema, arquivo } = dados;

    let query =
      "UPDATE material SET titulo = $1, materia = $2, tema = $3, subtema = $4";
    const values = [titulo, materia, tema, subtema];
    let placeholderIndex = 5;

    if (arquivo) {
      query += `, arquivo = $${placeholderIndex}`;
      values.push(arquivo);
      placeholderIndex++;
    }

    query += ` WHERE id = $${placeholderIndex}`;
    values.push(idMaterial);

    await pool.query(query, values);
    console.log("EDITANDO MATERIAL:", idMaterial, dados);
    return true;
  }

  // Deleta um material pelo ID
  static async deletarMaterial(idMaterial) {
    const query = "DELETE FROM material WHERE id = $1";
    await pool.query(query, [idMaterial]);
    return true;
  }

  static async buscarRedacoesPendentes() {
    // Usa TRUE/FALSE para booleanos
    const result = await pool.query(
      "SELECT * FROM redacoes WHERE corrigida = FALSE AND corrigida_por_professor = TRUE"
    );
    return result.rows;
  }

  static async corrigirRedacao(idRedacao, comps, feedback, professor_id) {
    const { comp1, comp2, comp3, comp4, comp5 } = comps;
    // PostgreSQL não aceita $N dentro de cálculos, então passamos o cálculo da média
    // como uma expressão SQL ou o fazemos no JS e passamos o resultado.
    const nota_professor = (comp1 + comp2 + comp3 + comp4 + comp5) / 5;

    await pool.query(
      `UPDATE redacoes 
            SET comp1 = $1, comp2 = $2, comp3 = $3, comp4 = $4, comp5 = $5,
                nota_professor = $6,
                feedback = $7,
                corrigida = TRUE,
                corrigida_por_professor = TRUE
            WHERE id = $8`,
      [
        comp1,
        comp2,
        comp3,
        comp4,
        comp5,
        nota_professor,
        feedback,
        idRedacao, // professor_id é o 8º placeholder
      ]
    );

    return true;
  }
}

module.exports = Professor;
