import 'dotenv/config';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // user: String(process.env.DB_USER),
    // password: String(process.env.DB_PASSWORD),
    // host: String(process.env.DB_HOST),
    // database: String(process.env.DB_DATABASE),
    // port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false}: undefined,
});

const connectorSchemaFilePath = path.resolve(__dirname, "./src/schema/connector.schema.sql");
const connectorSchemaSQL = fs.readFileSync(connectorSchemaFilePath, "utf-8");

const createTables = async () => {
    try {
        const result = await pool.query(`
            SELECT COUNT(table_name) = 3 AS all_exist 
            FROM information_schema.tables
            WHERE table_schema = 'connector' 
                AND table_name IN ('users', 'edges', 'nodes');
            `);
        const tableExist: boolean = result.rows[0].all_exist;
        if (!tableExist) {
            await pool.query(connectorSchemaSQL);
            console.log("Tables created successfully");

        } else {
            console.log("Users table already exists");
        }
    } catch (error) {
        console.error("Error creating tables:"), error;
    };
};

export const connectDB = async() => {
    try {
        await pool.connect();
        console.log("Database connected successfully");
        await createTables;
    } catch (err) {
        console.error("Error connecting to database: ", err)
    };
};