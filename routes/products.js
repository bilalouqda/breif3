const express = require('express');
const router = express.Router();
const { createProduct , getAllProducts , searchProducts , paginateProducts, getProductById, updateProduct , deleteProduct} = require('../controllers/productController');
const {authMiddleware,authorize}= require('../middleware/authMiddleware');

router.post('/', authMiddleware,authorize('admin', 'user') , createProduct);
router.get('/', authMiddleware,authorize('admin', 'user') , getAllProducts);
router.get('/search', authMiddleware,authorize('admin', 'user') , searchProducts);
router.get('/paginate', authMiddleware,authorize('admin', 'user') , paginateProducts);
router.get('/:id', authMiddleware,authorize('admin', 'user') , getProductById);
router.put('/:id', authMiddleware,authorize('admin', 'user') , updateProduct);
router.delete('/:id', authMiddleware,authorize('admin', 'user') , deleteProduct);

module.exports = router;
