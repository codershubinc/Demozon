import express from "express"
import pool from "../db.js"

const router = express.Router()

// Get all products
router.get("/", async (req, res) => {
    try {
        const connection = await pool.getConnection()
        const [products] = await connection.query(
            "SELECT p.*, u.name as vendor_name, u.email as vendor_email FROM products p JOIN users u ON p.user_id = u.id"
        )
        connection.release()
        res.status(200).json({ message: "Products fetched", data: products })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Get product by id
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params
        const connection = await pool.getConnection()
        const [products] = await connection.query(
            "SELECT p.*, u.name as vendor_name, u.email as vendor_email FROM products p JOIN users u ON p.user_id = u.id WHERE p.id = ?",
            [id]
        )
        connection.release()

        if (products.length === 0) {
            return res.status(404).json({ error: "Product not found" })
        }

        res.status(200).json({ message: "Product fetched", data: products[0] })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Get products by vendor/user id
router.get("/vendor/:userId", async (req, res) => {
    try {
        const { userId } = req.params
        const connection = await pool.getConnection()
        const [products] = await connection.query(
            "SELECT p.*, u.name as vendor_name, u.email as vendor_email FROM products p JOIN users u ON p.user_id = u.id WHERE p.user_id = ?",
            [userId]
        )
        connection.release()
        res.status(200).json({ message: "Products fetched", data: products })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Create product
router.post("/", async (req, res) => {
    try {
        const { name, description, price, stock, user_id } = req.body

        if (!name || !price || stock === undefined || !user_id) {
            return res.status(400).json({ error: "Name, price, stock, and user_id are required" })
        }

        const connection = await pool.getConnection()

        // Check if user exists
        const [userExists] = await connection.query("SELECT id FROM users WHERE id = ?", [user_id])
        if (userExists.length === 0) {
            connection.release()
            return res.status(404).json({ error: "User not found" })
        }

        const result = await connection.query(
            "INSERT INTO products (name, description, price, stock, user_id) VALUES (?, ?, ?, ?, ?)",
            [name, description || null, price, stock, user_id]
        )
        connection.release()

        res.status(201).json({
            message: "Product created successfully",
            data: { id: result[0].insertId, name, description, price, stock, user_id }
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Update product
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params
        const { name, description, price, stock, user_id } = req.body

        if (!name || !price || stock === undefined || !user_id) {
            return res.status(400).json({ error: "Name, price, stock, and user_id are required" })
        }

        const connection = await pool.getConnection()

        // Check if user exists
        const [userExists] = await connection.query("SELECT id FROM users WHERE id = ?", [user_id])
        if (userExists.length === 0) {
            connection.release()
            return res.status(404).json({ error: "User not found" })
        }

        const result = await connection.query(
            "UPDATE products SET name = ?, description = ?, price = ?, stock = ?, user_id = ? WHERE id = ?",
            [name, description || null, price, stock, user_id, id]
        )
        connection.release()

        if (result[0].affectedRows === 0) {
            return res.status(404).json({ error: "Product not found" })
        }

        res.status(200).json({
            message: "Product updated successfully",
            data: { id, name, description, price, stock, user_id }
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Delete product
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params
        const connection = await pool.getConnection()
        const result = await connection.query("DELETE FROM products WHERE id = ?", [id])
        connection.release()

        if (result[0].affectedRows === 0) {
            return res.status(404).json({ error: "Product not found" })
        }

        res.status(200).json({ message: "Product deleted successfully" })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

export default router
