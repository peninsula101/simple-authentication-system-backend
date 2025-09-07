const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({ message: 'Email already exists.' });
                }
                return res.status(500).json({ message: 'Registration failed.' });
            }
            res.status(201).json({ message: 'User registered successfully!' });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during hashing.' });
    }
});

// Login route
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Server error.' });
        }
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }
        req.session.userId = user.id;
        res.status(200).json({ message: 'Logged in successfully!' });
    });
});

// Logout route
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out.' });
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.status(200).json({ message: 'Logged out successfully.' });
    });
});

router.get('/check-session', (req, res) => {
  if (req.session.user) {
    // Session exists, user is logged in
    res.status(200).json({ isLoggedIn: true, user: req.session.user });
  } else {
    // No session, user is not logged in
    res.status(401).json({ isLoggedIn: false });
  }
});

module.exports = router;