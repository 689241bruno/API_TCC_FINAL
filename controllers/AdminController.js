require("dotenv").config();
const Admin = require("../models/usuarios/Admin.class");

exports.cadastrarAdmin = async (req, res) => {
  let client;

  try {
    const { usuario_id, usuario_email } = req.body;

    const pool = require("../config/db");

    client = await pool.connect();

    const result = await Admin.cadastrar(usuario_id, usuario_email, client);

    res.status(201).json({
      mensagem: "Administrador cadastrado com sucesso!",
      result,
    });
  } catch (err) {
    console.error("Erro ao cadastrar admin:", err);
    res.status(500).json({ erro: "Erro ao cadastrar admin!" });
  } finally {
    if (client) {
      client.release();
    }
  }
};
exports.listarAdmins = async (req, res) => {
    try {
        const admins = await Admin.listar();
        res.json(admins);
    } catch (err) {
        console.error("Erro ao listar admins:", err);
        res.status(500).json({ erro: "Erro ao listar administradores!" });
    }
}; 

exports.alterClass = async(req, res) => {
    try {
        // const query = "ALTER TABLE material ALTER COLUMN arquivo TYPE TEXT";
        // const result = await Admin.alterar(query);
        console.log(process.env.AWS_BUCKET_NAME)
    } catch (error) {
        console.error("Erro ao alterar admins:", error);
        res.status(500).json({ erro: "Erro ao alterar administradores!" });
    }
}
