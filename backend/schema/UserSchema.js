const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    gmail: {
        type: String,
        required: true
    },
    mobilenumber: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('user', UserSchema);