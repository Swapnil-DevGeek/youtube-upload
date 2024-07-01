const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/file');
const cors = require('cors');

dotenv.config();

const port = process.env.PORT || 8000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/file',fileRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });
