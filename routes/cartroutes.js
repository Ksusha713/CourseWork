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
	if (!cart.length ) {
        const [newCart] = await connection.query(`INSERT INTO Cart (userID) VALUES (?)`, 
		[user]
		);
		console.log('newly createdn casdrysdf',newCart)
		CartID = newCart.insertId
    } else {
		CartID = cart[0].CartID;
	}
	const [products] = await connection.query(
		`SELECT * FROM CartItems Where ProductID = ? AND CartID = ?`,
		[id, CartID]
	)
    if (products.length > 0) {
		console.log(products)
        const newQuantity = parseInt(products[0].Quantity)+ parseInt(quantity)
        await connection.query(
			`UPDATE CartItems
			SET Quantity = ?
			WHERE ProductID = ?`,
			[newQuantity, id]
		)
    } else {
        const [products] = await connection.query(
			`INSERT INTO CartItems (ProductID, Quantity, CartID) VALUES (?, ?, ?)`,
		[id, quantity, CartID]	
		)
    } 
	
    res.json({ status: 200, message: "Added" })
});

router.get('/', async (req, res) => {
    const user = req.cookies.User || [];
	if (!user) {
		return res.redirect('/login');
	}
    const [cartIDs] = await connection.query(
		`SELECT CartID FROM Cart WHERE UserID = ?`,
		[user]
	)
    let sum = 0
	let cartDetails = [];
	const {CartID} = cartIDs[0]
	if (CartID > 0) {
		const [results] = await connection.query(
			`SELECT ProductID, Quantity FROM CartItems WHERE CartID = ?`,
			[CartID]
		)
		for (const item of results) {
			const [products] = await connection.query(
				`SELECT Name, Price, Description, Image FROM Products WHERE ProductID = ?`,
				[item.ProductID]
			)
			if (products.length) {
				cartDetails.push({
				quantity: item.Quantity,
				image: products[0].Image,
				price: products[0].Price,
				name: products[0].Name,
				description: products[0].Description
        	})}
			sum += products[0].Price * item.Quantity
		}
		const [total] = await connection.query(
			`INSERT INTO Cart (Total) VALUES (?)`,
			[sum]
		)
    } else {
		res.json({ status: 400, message: "Cart is not found" })
	}
	console.log('cart id:',CartID)
	console.log("Details:", cartDetails);
    console.log("Sum:", sum);
    res.render('cart', { cart: cartDetails, sum: sum });
});

export default router
