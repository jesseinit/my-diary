import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = {
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD
};

const pool = new pg.Pool(connectionString);

const usersTable = `CREATE TABLE IF NOT EXISTS users
(
  id SERIAL PRIMARY KEY,
  email VARCHAR (100) UNIQUE NOT NULL,
  fullname VARCHAR (255) NOT NULL,
  password VARCHAR (255) NOT NULL,
  created_on TIMESTAMPTZ DEFAULT now() NOT NULL
);`;

const dairiesTable = `CREATE TABLE IF NOT EXISTS diaries 
(
  id SERIAL PRIMARY KEY,
  email VARCHAR (100) NOT NULL,
  title VARCHAR (100) NOT NULL,
  content Text,
  created_on TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_on TIMESTAMPTZ DEFAULT now() NOT NULL
);`;

pool.query(`${usersTable} ${dairiesTable}`);

export default pool;
