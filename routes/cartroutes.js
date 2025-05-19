import { Router } from 'express';

const router = Router();

router.post('/add-to-cart', (req, res) => {
    console.log(req.body)
    let { id, quantity } = req.body;
    if (!id || !quantity) {
        res.json({status: 400, message: "Body is not complete"})
    }
    let cart = req.cookies.cart;
    console.log(cart)
    if (!cart) {
        cart = []
    } 
    const product = cart.find(p => p.id == id);
    if (product) {
        quantity = parseInt(quantity)
        product.quantity += quantity;
    } else {
        quantity = parseInt(quantity)
        cart.push({id, quantity})
    }
    res.cookie("cart", cart);
    res.json({status: 200, message: "Added"})
})

export default router