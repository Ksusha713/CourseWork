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

app.get('/checkout', (req, res) => {
    res.render('checkout')
})

app.post('/checkout', async (req, res) => {
    const { name, address, payment, shipment } = req.body;
    if (!name || !address || !payment || !shipment) {
        return res.render("signup", { error: "All fields are required" });
    }
    if (cart != []) {
        for (const product of cart) {
            await connection.query(
                `INSERT INTO OrderItems 
                (OrderID, ProductID, Quantity) 
                VALUES (?, ?, ?)`,
                [orderId, product.id, product.quantity]
            );
        }
    } else {
        return res.render("checkout", { error: "The cart is empty" });
    }
    res.clearCookie('cart');
    // const [results] = await connection.query(
    //     `INSERT INTO Orders (Name, )`
    // )
    res.redirect(`/order/confirmation/${orderId}`); 
})