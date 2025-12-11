import mysql from 'mysql2/promise'

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'YOUR_ACTUAL_PASSWORD',
    database: 'demozon',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

export default pool
