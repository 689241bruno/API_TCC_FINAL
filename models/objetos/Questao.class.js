const pool = require("../../config/db");

class Questao {
    constructor(
        id,
        titulo,
        enunciado,
        ano,
        prova,
        materia,
        tema,
        alternativas
    ) {
        this.id           = id;
        this.titulo       = titulo;
        this.enunciado    = enunciado;
        this.ano          = ano;
        this.prova        = prova;
        this.materia      = materia;
        this.tema         = tema;
        this.alternativas = alternativas;
    }

    static async listar() {
        const [rows] = await pool.query(`
            SELECT 
                q.*,
                a.*
            FROM questoes q
            LEFT JOIN alternativas a ON a.questao_id = q.id
            ORDER BY q.id DESC
        `);

        return rows.map(r => ({
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
                { letra: r.letra5, texto: r.texto5, correta: r.correta == 5 }
            ]
        }));
    }

    static async buscarPorId(id) {
        const [rows] = await pool.query(`
            SELECT 
                q.*,
                a.*
            FROM questoes q
            LEFT JOIN alternativas a ON a.questao_id = q.id
            WHERE q.id = ?
        `, [id]);

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
                { letra: r.letra5, texto: r.texto5, correta: r.correta == 5 }
            ]
        };
    }

    static async criar({ titulo, enunciado, ano, prova, materia, tema, alternativas }) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const [result] = await conn.query(`
                INSERT INTO questoes (titulo, enunciado, ano, prova, materia, tema)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [titulo, enunciado, ano, prova, materia, tema]);

            const questaoId = result.insertId;

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
                correta: alternativas.findIndex(a => a.correta) + 1
            };

            await conn.query(`
                INSERT INTO alternativas (
                    letra1, texto1,
                    letra2, texto2,
                    letra3, texto3,
                    letra4, texto4,
                    letra5, texto5,
                    correta, questao_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                alternativa.letra1, alternativa.texto1,
                alternativa.letra2, alternativa.texto2,
                alternativa.letra3, alternativa.texto3,
                alternativa.letra4, alternativa.texto4,
                alternativa.letra5, alternativa.texto5,
                alternativa.correta,
                questaoId
            ]);

            await conn.commit();
            return questaoId;

        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    }

    static async editar(id, dados) {
        const conn = await pool.getConnection();

        try {
            await conn.beginTransaction();

            const { titulo, enunciado, ano, prova, materia, tema, alternativas } = dados;

            await conn.query(`
                UPDATE questoes
                SET titulo=?, enunciado=?, ano=?, prova=?, materia=?, tema=?
                WHERE id=?
            `, [titulo, enunciado, ano, prova, materia, tema, id]);

            const correta = alternativas.findIndex(a => a.correta) + 1;

            await conn.query(`
                UPDATE alternativas SET
                    letra1=?, texto1=?,
                    letra2=?, texto2=?,
                    letra3=?, texto3=?,
                    letra4=?, texto4=?,
                    letra5=?, texto5=?,
                    correta=?
                WHERE questao_id=?
            `, [
                alternativas[0].letra, alternativas[0].texto,
                alternativas[1].letra, alternativas[1].texto,
                alternativas[2].letra, alternativas[2].texto,
                alternativas[3].letra, alternativas[3].texto,
                alternativas[4].letra, alternativas[4].texto,
                correta,
                id
            ]);

            await conn.commit();
            return true;

        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    }

    static async deletar(id) {
        await pool.query("DELETE FROM questoes WHERE id=?", [id]);
        return true;
    }

    static async sortear(materia, tema, quantidade = 10) {
        const [rows] = await pool.query(`
            SELECT id FROM questoes
            WHERE materia LIKE ? AND tema LIKE ?
            ORDER BY RAND()
            LIMIT ?
        `, [`%${materia}%`, `%${tema}%`, quantidade]);

        return rows.map(r => r.id);
    }

    static async verificarRespostas(respostasUsuario) {
        const resultado = [];

        for (const r of respostasUsuario) {
            const [rows] = await pool.query(`
                SELECT correta FROM alternativas
                WHERE questao_id = ?
            `, [r.questaoId]);

            const correta = rows[0]?.correta;

            resultado.push({
                questaoId: r.questaoId,
                usuario: r.respostaUsuario,
                correta,
                acertou: Number(r.respostaUsuario) === Number(correta)
            });
        }

        return resultado;
    }
}

module.exports = Questao;