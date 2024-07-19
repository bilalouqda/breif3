const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name : { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['user', 'admin'],
        default: 'user' 
    },  
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ordre'
    }]
});

// Pre-save hook to hash the password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
};

// userSchema.methods.generateAuthToken = function() {
//     const token = jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//     console.log(token);
//     return token;
// }; 


userSchema.methods.isValidPassword = async function(password) {
    const pass = await bcrypt.compare(password, this.password);
    console.log(pass);
    return pass
};

const User = mongoose.model('User', userSchema);

module.exports = User;
