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

router.get('/', (req, res) => {
    res.render('checkout')
})

router.post('/', async (req, res) => {
	const { name, address, payment, shipment } = req.body;
	if (!name || !address || !payment || !shipment) {
        return res.render("checkout", { error: "All fields are required", previousInput: req.body });
    }

	const user = req.cookies.User || [];
	if (!user) {
		return res.redirect('/login');
	}
	const [cartDetails] = await connection.query(
		`SELECT CartID, Total FROM Cart WHERE UserID = ?`,
		[user]
	)
    
	const trackingNumber = Math.floor(100000 + Math.random() * 900000);
	const {CartID, total} = cartDetails[0]

    if (CartID > 0) {
		const [results] = await connection.query(
			`INSERT INTO Orders (UserID, OrderDate, TotalPrice, TrackingNumber, PaymentMethod, ShipmentMethod, Address, CartID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			[user, new Date(), total, trackingNumber, payment, shipment, address, CartID]    
    	)
		const OrderId = results.insertId;
		res.redirect(`/checkout/confirmation/${OrderId}`); 
	}else{
        return res.render("checkout", { error: "The cart is empty" });
    }    
})

router.get('/confirmation/:id', async (req, res) => {
	const OrderID = req.params.id;
	if (!OrderID) {
		res.redirect("/cart");
	}
	const [results] = await connection.query(
		`SELECT TrackingNumber FROM Orders WHERE OrderID = ?`, 
		[OrderID]
	)
	const {TrackingNumber} = results[0]

	console.log("Tracking number:", TrackingNumber);
	res.render('confirmation', { 
		trackingNumber: TrackingNumber
	});
})

export default router;