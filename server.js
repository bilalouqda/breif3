const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const userRoute = require('./routes/users')
const productsRoute = require('./routes/products')
const ordersRoute = require('./routes/orders');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.use("/users",userRoute)
app.use("/products",productsRoute)
app.use("/orders",ordersRoute)
// app.use(logger);
// Middleware pour parser le corps des requêtes en JSON
app.use(bodyParser.json());

mongoose.connect(process.env.URL)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
