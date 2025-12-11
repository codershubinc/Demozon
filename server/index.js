import express from "express"
import pool from "./db.js"
import bcrypt from "bcryptjs"
import productsRouter from "./routes/products.js"
import cartRouter from "./routes/cart.js"
import cors from "cors"

console.log("hello");

const app = express()

app.use(cors({
    origin: true,
    credentials: true
}));

// Middleware
app.use(express.json())

app.get("/", (req, res) => {
    res.status(200).json({ test: "msg" })
})

app.get("/api/test", async (req, res) => {
    try {
        const connection = await pool.getConnection()
        const [rows] = await connection.query("SELECT 1 as test")
        connection.release()
        res.status(200).json({ message: "MySQL Connected", data: rows })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Routes
app.use("/api/products", productsRouter)
app.use("/api/cart", cartRouter)

// Signup endpoint
app.post("/api/signup", async (req, res) => {
    try {
        const { email, password, name } = req.body

        if (!email || !password || !name) {
            return res.status(400).json({ error: "Email, password, and name are required" })
        }

        const connection = await pool.getConnection()

        // Check if user already exists
        const [existingUser] = await connection.query("SELECT * FROM users WHERE email = ?", [email])
        if (existingUser.length > 0) {
            connection.release()
            return res.status(409).json({ error: "User already exists" })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Insert user
        await connection.query("INSERT INTO users (email, password, name) VALUES (?, ?, ?)", [
            email,
            hashedPassword,
            name
        ])

        connection.release()
        res.status(201).json({ message: "User created successfully" })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Login endpoint
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" })
        }

        const connection = await pool.getConnection()

        // Find user
        const [users] = await connection.query("SELECT * FROM users WHERE email = ?", [email])

        if (users.length === 0) {
            connection.release()
            return res.status(401).json({ error: "Invalid email or password" })
        }

        const user = users[0]

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            connection.release()
            return res.status(401).json({ error: "Invalid email or password" })
        }

        connection.release()

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000")
    console.log("MySQL pool initialized")
})