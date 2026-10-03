const path = require("path");
const { Pool } = require("pg");

require("dotenv").config({
    path: path.join(__dirname, "../../.env")
});

const pool = new Pool({

    host: process.env.DB_HOST,

    port: process.env.DB_PORT,

    database: process.env.DB_NAME,

    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD,

    ssl: process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false
    
});

module.exports = pool;