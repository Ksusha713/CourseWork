import { Router } from 'express';
import { createConnection } from 'mysql2';
import mysql from 'mysql2/promise';

const router = Router();
let connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Kseniia-2006",
    database: "webshop",
});

router.post('/add-to-cart', (req, res) => {
    let { id, quantity } = req.body;
    if (!id || !quantity) {
        res.json({ status: 400, message: "Body is not complete" })
    }
    let cart = req.cookies.cart;
    if (!cart) {
        cart = []
    }
    const product = cart.find(p => p.id == id);
    if (product) {
        quantity = parseInt(quantity)
        product.quantity += quantity;
    } else {
        quantity = parseInt(quantity)
        cart.push({ id, quantity })
    }
    res.cookie("cart", cart);
    res.json({ status: 200, message: "Added" })
});

router.get('/', async (req, res) => {
    const cart = req.cookies.cart || [];
    const cartDetails = [];
    let sum = 0
    for (const product of cart) {
        const [results] = await connection.query(
            `SELECT Image, Name, Price, Description FROM Products WHERE ProductID = ?`,
            [product.id]
        )
        cartDetails.push({
            quantity: product.quantity,
            image: results[0].Image,
            price: results[0].Price,
            name: results[0].Name,
            description: results[0].Description
        })
        sum += results[0].Price * product.quantity
    }
    res.render('cart', { cart: cartDetails, sum: sum });
});

export default router