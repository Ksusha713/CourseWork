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

router.post('/add-to-cart', async (req, res) => {
    let { id, quantity } = req.body;
    if (!id || !quantity) {
        res.json({ status: 400, message: "Body is not complete" })
    }
	const user = req.cookies.User;
	const [cart] = await connection.query(
		`SELECT * FROM Cart WHERE UserID = ?`,
		[user]
	);
	console.log()
	let CartID;
	let product;
	if (!cart.length ) {
        const [newCart] = await connection.query(`INSERT INTO Cart (userID) VALUES (?)`, 
		[user]
		);
		console.log('newly createdn casdrysdf',newCart)
		CartID = newCart.insertId
    } else {
		CartID = cart[0].CartID;
	}
	const products = await connection.query(
		`SELECT * FROM Products Where ProductID = ? AND CartID = ?`,
		[id, CartID]
	)
    if (products.length > 0) {
        quantity = parseInt(quantity)
        await connection.query(
			`UPDATE CartItems
			SET Quantity = ?
			WHERE ProductID = ?`,
			[quantity, id]
		)
    } else {
        products = await connection.query(
			`INSERT INTO CartItems (ProductID, Quantity, CartID) VALUES (?, ?, ?)`,
		[id, quantity, CartID]	
		)
    } 
	// const [result] = await connection.query(
	// 	`INSERT INTO CartItems (ProductID, Quantity, CartID) VALUES (?, ?, ?)`, 
	// 	[id, quantity, CartID]
  	// );
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
    cart.sum = sum;
    res.cookie('cart', cart);
    res.render('cart', { cart: cartDetails, sum: sum });
});

export default router

// user from cookie
// getcart from db using usersId
//if not exist, create by inserting