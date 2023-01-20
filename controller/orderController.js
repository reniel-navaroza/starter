const Order = require('../models/Order')
const Product = require('../models/Product')

const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')

const { checkPermissions } = require('../utils')

const fakeStripeAPI = async ({ amount, currency }) => {
    const client_secret = 'someRandomValue'
    return { client_secret, amount };
}

const createOrder = async (req, res) => {
    const { items: cartItems, tax, shippingFee } = req.body;

    if (!cartItems || cartItems < 1) {
        throw new CustomError.BadRequestError('No cart items provided')
    }
    if (!tax || !shippingFee) {
        throw new CustomError.BadRequestError('Please provide tax and shipping fee')
    }

    let orderItems = [];
    let subtotal = 0;

    for (const item of cartItems) {
        const dbProduct = await Product.findOne({ _id: item.product })
        if (!dbProduct) {
            throw new CustomError.NotFoundError(` No product with the id of ${item.product}`)
        }
        const { name, price, image, _id } = dbProduct;
        const singleOrderItem = {
            amount: item.amount,
            name,
            price,
            image,
            product: _id,
        };
        // add item to order
        orderItems = { ...orderItems, singleOrderItem }
        subtotal += item.amount * price;
        // calculate total
        const total = tax + shippingFee + subtotal;
        // get client secret
        const paymentIntent = await fakeStripeAPI({
            amount: total, currency: 'usd',
        });
        const order = await Order.create({
            orderItems,
            total,
            subtotal,
            tax,
            shippingFee,
            clientSecret: paymentIntent.client_secret,
            user: req.user.userId,
        });
        res.status(StatusCodes.CREATED).json({ order, clientSecret: order.client_secret })
    }

    // res.send('Create order');
}
const getAllOrders = async (req, res) => {
    res.send('Get all orders');
}
const getSingleOrder = async (req, res) => {
    res.send('Get single order');
}
const getCurrentUserOrders = async (req, res) => {
    res.send('Get current user orders');
}
const updateOrder = async (req, res) => {
    res.send('Update orders');
}

module.exports = {
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrders,
    createOrder,
    updateOrder
}