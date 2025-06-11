import { Router } from 'express';
import { createConnection } from 'mysql2';
import mysql from 'mysql2/promise';

const router = Router();
let connection = await mysql.createConnection({
	host: "shortline.proxy.rlwy.net",
	user: "root",
	password: "gvWbYBsHDJlqgilzJWHKhmcVMEKVUvSd",
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
	if (!cart.length) {
		const [newCart] = await connection.query(`INSERT INTO Cart (userID) VALUES (?)`,
			[user]
		);
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
		const newQuantity = parseInt(products[0].Quantity) + parseInt(quantity)
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
	const user = req.cookies.User;
	if (!user) {
		return res.redirect('/login');
	}
	const [cartIDs] = await connection.query(
		`SELECT CartID FROM Cart WHERE UserID = ?`,
		[user]
	)
	if (!cartIDs.length) {
		return res.json({ status: 400, message: "Cart not found" });
	}
	let sum = 0
	let cartDetails = [];
	const { CartID } = cartIDs[0]
	if (CartID > 0) {
		const [results] = await connection.query(
			`SELECT CartItems.ProductID, CartItems.Quantity, Products.Name, Products.Price, Products.Description, Products.Image
			FROM CartItems 
			INNER JOIN Products on CartItems.ProductID = Products.ProductID
			WHERE CartID = ?`,
			[CartID]
		)
		if (results.length === 0) {
			return res.render('cart', { cart: [], sum: 0 });
		}
		for (const item of results) {
			cartDetails.push({
				ProductID: item.ProductID,
				quantity: item.Quantity,
				image: item.Image,
				price: item.Price,
				name: item.Name,
				description: item.Description
			})
			sum += item.Price * item.Quantity
		}
	}
	const [total] = await connection.query(
		`UPDATE Cart SET Total = ? WHERE CartID = ?`,
		[sum, CartID]
	)
	res.render('cart', { cart: cartDetails, sum: sum });
});

router.post('/remove', async (req, res) => {
	const user = req.cookies.User;
	const { id } = req.body;
	if (!user) {
		return res.redirect('/login');
	}
	const [cart] = await connection.query(
		`SELECT CartID FROM Cart WHERE UserID = ?`,
		[user]
	);
	const CartID = cart[0].CartID;
	await connection.query(
		`DELETE FROM CartItems WHERE ProductID = ? and CartID = ?`,
		[id, CartID]
	)
	const [results] = await connection.query(
		`SELECT CartItems.Quantity, Products.Price
			FROM CartItems 
			INNER JOIN Products on CartItems.ProductID = Products.ProductID
			WHERE CartID = ?`,
		[CartID]
	)
	let sum = 0;
	for (const item of results) {
		sum += item.Price * item.Quantity
	}
	await connection.query(
		`UPDATE Cart SET Total = ? WHERE CartID = ?`,
		[sum, CartID]
	);
	res.json({ status: 200, message: "Removed" })
});

export default router
