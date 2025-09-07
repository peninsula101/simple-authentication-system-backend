const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const app = express();
const port = 5000;

app.use(cors({
    origin: 'https://simple-authentication-system-fronte.vercel.app',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: 'secret-key-that-should-be-in-env',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 
    }
}));

app.use('/api/auth', authRoutes);

app.get('/api/dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }
    res.status(200).json({ message: 'Welcome to the dashboard!' });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
