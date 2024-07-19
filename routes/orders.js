const express = require('express');
const router = express.Router();
const { createOrder, getAllOrders, getOrderById , updateOrder, deleteOrder} = require('../controllers/orderController');

const {authMiddleware,authorize}= require('../middleware/authMiddleware');

router.post('/', authMiddleware,authorize('admin', 'user') , createOrder);
router.get('/', authMiddleware,authorize('admin', 'user'), getAllOrders);
router.get('/:id', authMiddleware,authorize('admin', 'user'), getOrderById);
router.put('/:id', authMiddleware,authorize('admin', 'user'), updateOrder);
router.delete('/:id', authMiddleware,authorize('admin', 'user'), deleteOrder);

module.exports = router;
