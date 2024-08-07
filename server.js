const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const userRoute = require('./routes/users')
const productsRoute = require('./routes/products')
const ordersRoute = require('./routes/orders');
const bodyParser = require('body-parser');
const rateLimit = require('./utils/rateLimite');
const passport = require('./utils/passport');


const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(rateLimit);
app.use(passport.initialize());


app.use("/users",userRoute)
app.use("/products",productsRoute)
app.use("/orders",ordersRoute)
// app.use(logger);
// Middleware pour parser le corps des requêtes en JSON
app.use(bodyParser.json());

// Protected routes
app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
  });

mongoose.connect(process.env.URL_DB)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

module.exports = app