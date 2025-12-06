const pool = require("../../config/db");

class Notificacao {
    constructor( 
        id, 
        usuario_id,
        titulo = "",
        mensagem = "",
        tipo = "",
    ) {
        this.id         = id;
        this.usuario_id = usuario_id;
        this.titulo     = titulo;
        this.mensagem   = mensagem;
        this.tipo       = tipo;
    }

    static async listar() {
        const [rows] = await pool.query("SELECT * FROM notificacoes ORDER BY id DESC");
        return rows;
    }

    static async criar(data) {
        const { titulo, mensagem, tipo } = data;

        const [result] = await pool.query(
            "INSERT INTO notificacoes (titulo, mensagem, tipo) VALUES (?, ?, ?)",
            [titulo, mensagem, tipo]
        );

        return { id: result.insertId, ...data };
    }

    static async editar(id, data) {
        const { titulo, mensagem, tipo } = data;

        await pool.query(
            "UPDATE notificacoes SET titulo = ?, mensagem = ?, tipo = ? WHERE id = ?",
            [titulo, mensagem, tipo, id]
        );

        return { id, ...data };
    }

    static async deletar(id) {
        await pool.query("DELETE FROM notificacoes WHERE id = ?", [id]);
        return true;
    }
}

module.exports = Notificacao;