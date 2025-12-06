const Usuario = require("./Usuario.class");
const connection = require("../../config/db")
class Professor extends Usuario {
    constructor(
        usuario_id,
        usuario_email,
        materia = ""
    ) {
        super(usuario_id);
        super(usuario_email);
        this.usuario_id    = usuario_id;
        this.usuario_email = usuario_email;
        this.materia       = materia;
    }

    static async listar() {
        const [rows] = await connection.query("SELECT * FROM professores");
        return rows;
    }

    static async cadastrar(usuario_id, materia = null, connection = pool) {
        const [result] = await connection.query(
            "INSERT INTO professores (usuario_id, materia) VALUES (?, ?)",
            [usuario_id, materia]
        );
        return { id: result.insertId, usuario_id, materia };
    }

    static async editar(usuario_id, materia) {
        await connection.query(
            "UPDATE professores SET materia = ? WHERE usuario_id = ?",
            [materia, usuario_id]
        );
        return true;
    }

    static async deletar(usuario_id) {
        await connection.query("DELETE FROM professores WHERE usuario_id = ?", [usuario_id]);
        return true;
    }

    static async publicarMaterial( tema, subtema, titulo, materia, arquivo, criado_por) {
        const result = await connection.query(
            "INSERT INTO material ( tema, subtema, materia, titulo, arquivo, criado_por) VALUES (?, ?, ?, ?, ?, ?)",
            [ tema, subtema, materia, titulo, arquivo, criado_por]
        );
        return result;
    }

    static async editarMaterial(idMaterial, dados) {
        const { titulo, materia, tema, subtema, arquivo } = dados;

        let query = "UPDATE material SET titulo = ?, materia = ?, tema = ?, subtema = ?";
        const values = [titulo, materia, tema, subtema];

        if (arquivo) {
            query += ", arquivo = ?";
            values.push(arquivo);
        }

        query += " WHERE id = ?";
        values.push(idMaterial);

        await connection.query(query, values);
        console.log("EDITANDO MATERIAL:", idMaterial, dados);
        return true;
    }

    // Deleta um material pelo ID
    static async deletarMaterial(idMaterial) {
        const query = "DELETE FROM material WHERE id = ?";
        await connection.query(query, [idMaterial]);
        return true;
    }

    static async buscarRedacoesPendentes() {
        const [rows] = await connection.query(
            "SELECT * FROM redacoes WHERE corrigida = 0 AND corrigida_por_professor = 1"
        );
        return rows;
    }

    static async corrigirRedacao(idRedacao, comps, feedback, professor_id) {
        const { comp1, comp2, comp3, comp4, comp5 } = comps;

        await connection.query(
            `UPDATE redacoes 
            SET comp1 = ?, comp2 = ?, comp3 = ?, comp4 = ?, comp5 = ?,
                nota_professor = (? + ? + ? + ? + ?) / 5,
                feedback = ?,
                corrigida = 1,
                corrigida_por_professor = ?
            WHERE id = ?`,
            [
                comp1, comp2, comp3, comp4, comp5,
                comp1, comp2, comp3, comp4, comp5, 
                feedback,
                professor_id, 
                idRedacao
            ]
        );

        return true;
    }

}

module.exports = Professor;