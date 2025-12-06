const Usuario = require("./Usuario.class");
const pool = require("../../config/db");
class Admin extends Usuario{
    constructor(
        usuario_id,
        usuario_email
    ) {
        super(usuario_id);
        super(usuario_email);
        this.usuario_id    = usuario_id;
        this.usuario_email = usuario_email;
    }

    static async cadastrar(usuario_id, usuario_email, connection = pool) {
        try {
            const [result] = await connection.query(
                "INSERT INTO admin (usuario_id, usuario_email) VALUES (?, ?)",
                [usuario_id, usuario_email]
            );
            return { id: result.insertId, usuario_id, usuario_email };
        } catch (err) {
            console.error("Erro ao cadastrar admin:", err.sqlMessage || err.message);
            throw new Error("Erro ao cadastrar admin: " + (err.sqlMessage || err.message));
        }
    }

    static async listar() {
        const [rows] = await pool.query("SELECT * FROM admins");
        return rows;
    }

} 

module.exports = Admin;