const request = require('supertest')
const app = require('../../server')
const mongoose = require('mongoose')
const Product = require('../../models/Product')

// beforeEach(async () => {
//     await product.deleteMany({})
// })

// afterEach(async () => {
//     await product.deleteMany({})
// })
beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/ecommerce2', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    })
})

afterAll(async () => {
    // await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
})

describe('Products Controller', () => {
    describe('GET /products', () => {
        it('should return all products', async () => {
            const product = new Product({ name: 'TEST', description: 'TEST', price: 190 })
            console.log(product);
            await product.save()
            const response = await request(app).get('/products')
            console.log(response.status);
            expect(response.status).toBe(200)
            expect(response.body.length).toBeGreaterThan(0)
        })

    })


    describe('GET /products/:id', () => {
        let product
        beforeEach(async () => {
            product = await Product.create({ name: 'TEST 2', description: 'TEST 2', price: 99 })
        })
        test('should return the product with the given id', async () => {
            const response = await request(app).get(`/products/${product._id}`)
            expect(response.status).toBe(200)
            expect(response.body.name).toBe('TEST 2')
        })
        test('should return 404 for non-existing product', async () => {
            const response = await request(app).get('/products/600000000000000000000000')
            expect(response.status).toBe(404)
        })
    })

    describe('POST /products', () => {
        test('should create a new product', async () => {
            const response = await request(app).post('/products').send({ name: 'TEST 3', description: 'TEST 2', price: 99 })
            expect(response.status).toBe(201)
            expect(response.body.name).toBe('TEST 3')
        })
        test('should return 400 for missing product name', async () => {
            const response = await request(app).post('/products').send({ description: 'TEST 3', price: 99 })
            expect(response.status).toBe(400)
        })
        test('should return 400 for missing product price', async () => {
            const response = await request(app).post('/products').send({ name: 'TEST 3', description: 'TEST 2' })
            expect(response.status).toBe(400)
        })
    })

})