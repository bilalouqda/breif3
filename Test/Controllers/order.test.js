const request = require('supertest');
const app = require('../../server');
const mongoose = require('mongoose');
const Order = require('../../models/Order');

beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/ecommerce_test', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

describe('Orders Controller', () => {
    describe('GET /orders', () => {
        it('should return all orders', async () => {
            const order = new Order({ userId: mongoose.Types.ObjectId(), products: [mongoose.Types.ObjectId()], date: '07/08/2024' });
            await order.save();
            const response = await request(app).get('/orders');
            expect(response.status).toBe(200);
            expect(response.body.length).toBeGreaterThan(0);
        });
    });

    describe('GET /orders/:id', () => {
        let order;
        beforeEach(async () => {
            order = await Order.create({ userId: mongoose.Types.ObjectId(), products: [mongoose.Types.ObjectId()], date: '07/08/2024'  });
        });
        test('should return the order with the given id', async () => {
            const response = await request(app).get(`/orders/${order._id}`);
            expect(response.status).toBe(200);
            expect(response.body.total).toBe(99);
        });
        test('should return 404 for non-existing order', async () => {
            const response = await request(app).get('/orders/600000000000000000000000');
            expect(response.status).toBe(404);
        });
    });

    describe('POST /orders', () => {
        test('should create a new order', async () => {
            const response = await request(app).post('/orders').send({ userId: mongoose.Types.ObjectId(), products: [mongoose.Types.ObjectId()], date: '07/08/2024'  });
            expect(response.status).toBe(201);
            expect(response.body.total).toBe(99);
        });
        test('should return 400 for missing userId', async () => {
            const response = await request(app).post('/orders').send({ products: [mongoose.Types.ObjectId()], date: '07/08/2024'  });
            expect(response.status).toBe(400);
        });
        test('should return 400 for missing products', async () => {
            const response = await request(app).post('/orders').send({ userId: mongoose.Types.ObjectId(), date: '07/08/2024'  });
            expect(response.status).toBe(400);
        });
    });

    describe('PUT /orders/:id', () => {
        let order;
        beforeEach(async () => {
            order = await Order.create({ userId: mongoose.Types.ObjectId(), products: [mongoose.Types.ObjectId()], date: '07/08/2024'  });
        });
        test('should update the order', async () => {
            const response = await request(app).put(`/orders/${order._id}`).send({ date: '07/08/2024'  });
            expect(response.status).toBe(200);
            expect(response.body.date).toBe(200);
        });
        test('should return 404 for non-existing order', async () => {
            const response = await request(app).put('/orders/600000000000000000000000').send({ date: '07/08/2024'  });
            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /orders/:id', () => {
        let order;
        beforeEach(async () => {
            order = await Order.create({ userId: mongoose.Types.ObjectId(), products: [mongoose.Types.ObjectId()], date: '07/08/2024'  });
        });
        test('should delete the order', async () => {
            const response = await request(app).delete(`/orders/${order._id}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Order deleted');
        });
        test('should return 404 for non-existing order', async () => {
            const response = await request(app).delete('/orders/600000000000000000000000');
            expect(response.status).toBe(404);
        });
    });
});
