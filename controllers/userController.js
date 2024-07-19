const User = require('../models/User');
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
