import sql from "mssql";
import dotenv from "dotenv";
dotenv.config();

const dbSeting = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

export const getConnectionAsync = async () => {
  try {
    const pool = await sql.connect(dbSeting);
    if (pool) {
      console.log("Db is connected");
    }
    return pool;
  } catch (error) {
    console.log(error);
  }
};

// // selct user qurry
