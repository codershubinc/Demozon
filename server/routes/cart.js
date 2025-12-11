import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Get cart items for a user
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const connection = await pool.getConnection();

        const [rows] = await connection.query(`
            SELECT c.id, c.quantity, p.id as product_id, p.name, p.price, p.description 
            FROM cart_items c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        `, [userId]);

        connection.release();
        res.json({ data: rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add item to cart
router.post('/', async (req, res) => {
    try {
        const { user_id, product_id, quantity = 1 } = req.body;

        if (!user_id || !product_id) {
            return res.status(400).json({ error: 'User ID and Product ID are required' });
        }

        const connection = await pool.getConnection();

        // Check if item already exists in cart
        const [existing] = await connection.query(
            'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
            [user_id, product_id]
        );

        if (existing.length > 0) {
            // Update quantity
            await connection.query(
                'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
                [quantity, existing[0].id]
            );
        } else {
            // Insert new item
            await connection.query(
                'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
                [user_id, product_id, quantity]
            );
        }

        connection.release();
        res.status(201).json({ message: 'Item added to cart' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove item from cart
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        await connection.query('DELETE FROM cart_items WHERE id = ?', [id]);

        connection.release();
        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
