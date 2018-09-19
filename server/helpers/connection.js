import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const usersTable = `CREATE TABLE IF NOT EXISTS users
(
  id SERIAL PRIMARY KEY,
  email VARCHAR (100) UNIQUE NOT NULL,
  fullname VARCHAR (255) NOT NULL,
  password VARCHAR (255) NOT NULL,
  created_on TIMESTAMPTZ DEFAULT now() NOT NULL,
  push_sub JSON,
  reminder boolean DEFAULT FALSE NOT NULL
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

const setupDbTables = () => pool.query(`${usersTable} ${dairiesTable}`);
export { pool, setupDbTables };
