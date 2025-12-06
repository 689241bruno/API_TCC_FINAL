const pool = require("../../config/db");

class Faq {
    constructor(
        id, 
        usuario_id, 
        pergunta, 
        resposta, 
        respondida, 
        pergunta_freq
    ) {
        this.id             = id;
        this.usuario_id     = usuario_id;
        this.pergunta       = pergunta;
        this.resposta       = resposta;
        this.respondida     = respondida;
        this.pergunta_freq  = pergunta_freq;
    }

    // Criar pergunta
    static async criarPergunta(usuario_id, pergunta) {
        const [result] = await pool.query(
            `INSERT INTO faq (usuario_id, pergunta, respondida, pergunta_freq)
             VALUES (?, ?, 0, 0)`,
            [usuario_id, pergunta]
        );

        return { id: result.insertId, usuario_id, pergunta };
    }

    // Responder pergunta
    static async responder(id, resposta) {
        await pool.query(
            `UPDATE faq SET resposta = ?, respondida = 1 WHERE id = ?`,
            [resposta, id]
        );
        return true;
    }

    // Listar todas (público)
    static async listarPublico() {
        const [rows] = await pool.query(
            `SELECT id, pergunta, resposta FROM faq WHERE respondida = 1 AND pergunta_freq = 1 ORDER BY id DESC`
        );
        return rows;
    }

    // Listar todas (admin)
    static async listarAdmin() {
        const [rows] = await pool.query(`SELECT * FROM faq ORDER BY id DESC`);
        return rows;
    }

    // Marcar como pergunta frequente
    static async marcarFrequente(id, valor) {
        await pool.query(
            `UPDATE faq SET pergunta_freq = ? WHERE id = ?`,
            [valor, id]
        );
        return true;
    }
}

module.exports = Faq;