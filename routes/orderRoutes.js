const express = require('express')
const router = express.Router();

const { authenticateUser, authorizedPermissions } = require('../middleware/authentication')

const {
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrders,
    createOrder,
    updateOrder
} = require('../controller/orderController')
router
    .route('/')
    .get([authenticateUser, authorizedPermissions('admin')], getAllOrders)
    .post(authenticateUser, createOrder)

router
    .route('/showAllMyOrders')
    .get(authenticateUser, getCurrentUserOrders)
router
    .route('/:id')
    .patch(authenticateUser, updateOrder)
    .get(authenticateUser, getSingleOrder)


module.exports = router