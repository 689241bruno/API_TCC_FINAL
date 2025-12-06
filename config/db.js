require("dotenv").config();
const { Pool } = require("pg");
const CONNECTION_STRING = process.env.DATABASE_URL;

if (!CONNECTION_STRING) {
  console.error(
    "Erro: A variável de ambiente DATABASE_URL não está definida no .env!"
  );
  process.exit(1);
}

const pool = new Pool({
  connectionString: CONNECTION_STRING,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("connect", () => {
  console.log("Conexão com PostgreSQL (Neon) estabelecida com sucesso!");
});

pool.on("error", (err) => {
  console.error("Erro inesperado no pool do PostgreSQL:", err);
  process.exit(-1);
});

module.exports = pool;
