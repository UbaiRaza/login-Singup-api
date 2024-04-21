const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// const { google } = require('googleapis');
// const otpGenerator = require('otp-generator');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Regular expression for email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/Login-Singup-all-api', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// User Model
const User = mongoose.model('User', {
    username: String,
    email: String,
    password: String
});

// Signup endpoint
app.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if email format is valid
        if (!emailRegex.test(email)) {
            return res.status(400).json({ msg: 'Invalid email format' });
        }

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Create new user
        user = new User({ username, email, password });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Save user to database
        await user.save();

        res.json({ msg: 'User registered successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email format is valid
        if (!emailRegex.test(email)) {
            return res.status(400).json({ msg: 'Invalid email format' });
        }

        // Check if user exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Generate JWT token
        const payload = {
            user: {
                id: user._id
            }
        };
        jwt.sign(payload, 'jwtSecret', { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Generate OTP endpoint


// Change Password endpoint
app.post('/change-password', async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;

        // Check if email format is valid
        if (!emailRegex.test(email)) {
            return res.status(400).json({ msg: 'Invalid email format' });
        }

        // Check if user exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        // Validate current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Current password is not correct' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update user's password
        user.password = hashedPassword;
        await user.save();

        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});






app.post('/forget-password', async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.body.email })
        if (userData) {
            const randomstring = randomstring.gerenate()
        } else {
            res.status(200).send({ success: false, msg: "The email does not exist" });

        }

    } catch (err) {
        res.status(400).send({ success: false, msg: err.message });
    }

})

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
