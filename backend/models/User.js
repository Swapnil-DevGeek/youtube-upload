const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['YouTuber', 'Editor'], required: true },
    secretKey: { type: String, unique: true, sparse: true }, // Sparse index allows null values
    associatedUser: { type: String, default: null }
});

module.exports = mongoose.model('User', UserSchema);