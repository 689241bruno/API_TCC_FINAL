const pool = require("../../config/db");

class Desafios {
    constructor( 
        id,
        titulo, 
        descricao, 
        materia, 
        quantidade,
        xp, 
        img
    ) {
        this.id         = id;
        this.titulo     = titulo;
        this.descricao  = descricao;
        this.materia    = materia;
        this.quantidade = quantidade;
        this.xp         = xp;
        this.img        = img;
    }

    // Listar todos os desafios
    static async listar() {
        const [rows] = await pool.query("SELECT * FROM desafios");

        const desafiosComBase64 = rows.map(d => ({
            ...d,
            img: d.img
            ? `data:image/png;base64,${d.img.toString('base64')}`
            : null
        }));

        return desafiosComBase64;
    }

    static async listarConquistas(usuario_id) {
        console.log("Buscando conquistas do usuário:", usuario_id);

        const [rows] = await pool.query(
            `SELECT d.*, pd.concluida_em
            FROM progresso_desafios pd
            INNER JOIN desafios d ON d.id = pd.desafio_id
            WHERE pd.usuario_id = ? AND pd.concluida = 1
            ORDER BY pd.concluida_em DESC`,
            [usuario_id]
        );

        console.log("Conquistas encontradas:", rows);

        const conquistas = rows.map(d => ({
            ...d,
            img: d.img
                ? `data:image/png;base64,${d.img.toString("base64")}`
                : null
        }));

        return conquistas;
    }

    // Criar desafio
    static async criar({ titulo, descricao, materia, quantidade, xp, img }) {
        const [result] = await pool.query(
            "INSERT INTO desafios (titulo, descricao, materia, quantidade, xp, img) VALUES (?, ?, ?, ?, ?, ?)",
            [titulo, descricao, materia, quantidade, xp, img]
        );
        return result.insertId;
    }

    // Editar desafio
    static async editar(id, dados) {
        const titulo = dados.titulo;
        const descricao = dados.descricao;
        const materia = dados.materia ?? null;
        const quantidade = dados.quantidade ?? null;
        const xp = dados.xp;
        const img = dados.img ?? null;
        
        await pool.query(
            "UPDATE desafios SET titulo = ?, descricao = ?, materia = ?, quantidade = ?, xp = ?, img = ? WHERE id = ?",
            [titulo, descricao, materia, quantidade, xp, img, id]
        );
        return true;
    }

    // Deletar desafio
    static async deletar(id) {
        await pool.query("DELETE FROM desafios WHERE id = ?", [id]);
        return true;
    }

    static async listarPorMateria(materia) {
        const [rows] = await pool.query(
            "SELECT * FROM desafios WHERE materia = ?",
            [materia]
        );

        return rows;
    }

    static async incrementarProgresso(usuario_id, desafio_id) {
        // Primeiro pegamos quantidade e progresso atual (se houver)
        const [[row]] = await pool.query(
            `SELECT d.quantidade,
                    COALESCE(pd.progresso, 0) AS progressoAtual,
                    COALESCE(pd.concluida, 0) AS concluida
            FROM desafios d
            LEFT JOIN progresso_desafios pd
            ON pd.desafio_id = d.id AND pd.usuario_id = ?
            WHERE d.id = ?`,
            [usuario_id, desafio_id]
        );

        if (!row) return false;

        // Se já marcou concluído, não incrementa
        if (row.concluida === 1) return false;

        const novoProgresso = row.progressoAtual + 1;
        const quantidade = row.quantidade;
        const concluiu = novoProgresso >= quantidade ? 1 : 0;

        try {
            if (row.progressoAtual > 0) {
                // Já existe: faz UPDATE (caso normal)
                await pool.query(
                    `UPDATE progresso_desafios
                    SET progresso = ?, concluida = ?, concluida_em = NOW()
                    WHERE usuario_id = ? AND desafio_id = ?`,
                    [novoProgresso, concluiu, usuario_id, desafio_id]
                );
            } else {
                // Tenta inserir (pode dar ER_DUP_ENTRY se concorrente)
                try {
                    await pool.query(
                        `INSERT INTO progresso_desafios
                        (usuario_id, desafio_id, progresso, concluida)
                        VALUES (?, ?, ?, ?)`,
                        [usuario_id, desafio_id, novoProgresso, concluiu]
                    );
                } catch (err) {
                    if (err && err.code === "ER_DUP_ENTRY") {
                        // Alguém inseriu entre o SELECT e o INSERT -> atualizar em fallback
                        await pool.query(
                            `UPDATE progresso_desafios
                            SET progresso = LEAST(progresso + 1, ?),
                                concluida = CASE WHEN LEAST(progresso + 1, ?) >= ? THEN 1 ELSE concluida END,
                                concluida_em = CASE WHEN LEAST(progresso + 1, ?) >= ? THEN NOW() ELSE concluida_em END
                            WHERE usuario_id = ? AND desafio_id = ?`,
                            [quantidade, quantidade, quantidade, quantidade, quantidade, usuario_id, desafio_id]
                        );
                    } else {
                        // outro erro, relança
                        throw err;
                    }
                }
            }

            return true;
        } catch (err) {
            console.error("[Desafios.incrementarProgresso] Erro SQL:", err);
            throw err;
        }
    }

    // Registrar progresso de usuário
    static async registrarProgresso(usuario_id, desafio_id, progresso, concluida) {
        const [exists] = await pool.query(
            "SELECT * FROM progresso_desafios WHERE usuario_id = ? AND desafio_id = ?",
            [usuario_id, desafio_id]
        );

        if (exists.length > 0) {
            await pool.query(
                "UPDATE progresso_desafios SET progresso = ?, concluida = ?, concluida_em = NOW() WHERE usuario_id = ? AND desafio_id = ?",
                [progresso, concluida ? 1 : 0, usuario_id, desafio_id]
            );
        } else {
            await pool.query(
                "INSERT INTO progresso_desafios (usuario_id, desafio_id, progresso, concluida) VALUES (?, ?, ?, ?)",
                [usuario_id, desafio_id, progresso, concluida ? 1 : 0]
            );
        }

        return true;
    }

    // Listar progresso do usuário
    static async listarProgresso(usuario_id) {
        const [rows] = await pool.query(
            `SELECT d.*, pd.progresso, pd.concluida, pd.concluida_em
            FROM desafios d
            LEFT JOIN progresso_desafios pd ON d.id = pd.desafio_id AND pd.usuario_id = ?`,
            [usuario_id]
        );
        return rows;
    }

    static async marcarConcluida(usuario_id, desafio_id) {
        const [rows] = await pool.query(
            "UPDATE progresso_desafios SET concluida = 1, concluida_em = NOW() WHERE usuario_id = ? AND desafio_id = ?",
            [usuario_id, desafio_id]
        );
        return rows;
    }
}

module.exports = Desafios;