const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendMail');

exports.createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({ name, email, password: hashedPassword });
        await user.save();

        const verificationToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        const verificationLink = `${process.env.URL}/api/verify-email/${verificationToken}`;
        await sendEmail(email, 'Verify Your Email', 'email', { name, verificationLink });

        res.status(201).json({ message: 'User registered successfully', user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        user.isVerified = true;
        await user.save();
        res.status(200).json({ message: 'Email verified successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error verifying email' });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        if (!user.isVerified) {
            return res.status(403).json({ message: 'Email not verified' });
        }

        const payload = { user: { id: user._id } };
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        res.cookie('refreshToken', refreshToken, { httpOnly: true, expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) });
        res.cookie('accessToken', accessToken, { httpOnly: true, expires: new Date(Date.now() + 1000 * 60 * 60) });

        res.status(200).json({ user, accessToken, refreshToken });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};const User = require('../models/User');
const jwt = require('jsonwebtoken');


exports.createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.findOne({ email });
        if(user){
            return res.status(400).json({ message: 'User already exists' })
        }
        // const verificationToken = crypto.randomBytes(20).ToString("hex")
        const token = user.generateAuthToken();
        user = new User({name, email, password, token})
        await user.save();
        const verificationLink = `${process.env.URL}/api/verify-email/${verificationCode}`;
        await sendEmail(
            email,
            'Verify Your email',
            'email',
            {name, verificationLink}
        )
        console.log(token)
        res.status(201).json({ user, token });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.verifyEmail = async (req,res)=>{
    try {
        const {token}= req.params
        const user = await User.findOne({verificationToken: token})
        if(!user){
            return res.status(400).json({ message: 'Invalid token' });
        }
        user.isVerified = true
        user.verificationToken = null
        await user.save()
        res.status(200).json({ message: 'Email verified successfully' });
        // sendEmail(
        //     user.email,
        //     'Welcome to our website!',
        //     'welcome',
        //     {name}
        // )
        // console.log('Email sent: ', email);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error verifying email' });
    }
}



exports.loginUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.findOne({ email });
        console.log("user",user);
        if (!user || !(await user.isValidPassword(password))) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        if(!user.isVerified){
            return res.status(403).json({ message: 'Email not verified' });
        }
        const checkPassword = await bycrpt.compare(password, user.password)
        if(!checkPassword){
            return res.status(400).json({ message: 'Invalid password' });
        }
        const payload = {user:{id : user.id}}
        console.log(payload);
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '1d'})
        res.cookie('refreshToken', refreshToken, { httpOnly: true, expires: new Date(Date.now() + 1000*60*60*24*7) }); // 7 days
        res.cookie('accessToken', accessToken, { httpOnly: true, expires: new Date(Date.now() + 1000*60*60) }); // 1 hour
        res.status(200).json({ user, accessToken, refreshToken });

        res.json({message: 'User logged successfully', data : payload})

        // const token = user.generateAuthToken();
        // console.log("token",token);
        // res.status(200).json({ user, token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().populate('orders');
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('orders');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



exports.refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token not found' });
        }

        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid refresh token' });
            }

            const user = await User.findById(decoded.user.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const payload = { user: { id: user.id } };
            const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
            const newRefreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

            res.cookie('refreshToken', newRefreshToken, { httpOnly: true, expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) }); // 7 days
            res.cookie('accessToken', newAccessToken, { httpOnly: true, expires: new Date(Date.now() + 1000 * 60 * 60) }); // 1 hour

            res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
