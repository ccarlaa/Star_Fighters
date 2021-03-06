import pg from "pg"
import dotenv from "dotenv";

dotenv.config()

const { Pool } = pg

const db = {
	// connectionString: process.env.DATABASE_URL,
  	user: "postgres",
	password: process.env.PASSWORD,
	database: "starfighters"
}

const connection = new Pool(db)

export default connection