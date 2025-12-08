const Usuario = require("./Usuario.class");
const pool = require("../../config/db");

class Admin extends Usuario {
  constructor(usuario_id, usuario_email) {
    super(usuario_id);
    super(usuario_email);
    this.usuario_id = usuario_id;
    this.usuario_email = usuario_email;
  }

  static async cadastrar(usuario_id, usuario_email, connection = pool) {
    try {
      await connection.query(
        "INSERT INTO admin (usuario_id, usuario_email) VALUES ($1, $2)",
        [usuario_id, usuario_email]
      );

      return { usuario_id, usuario_email };
    } catch (err) {
      console.error("Erro ao cadastrar admin:", err.message);
      throw new Error("Erro ao cadastrar admin: " + err.message);
    }
  }

  static async listar() {
    const result = await pool.query("SELECT * FROM admins");
    return result.rows;
  }

  static async alterar(sql) {
    const result = await pool.query(sql)
  }
}

module.exports = Admin;
