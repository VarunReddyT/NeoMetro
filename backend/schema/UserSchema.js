const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim : true 
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim : true
    },
    password: {
        type: String,
        required: true
    },
    gmail: {
        type: String,
        required: true,
        unique : true,
        trim : true
    },
    mobilenumber: {
        type: Number,
        required: true
    },
    notifications : {
        type : [
            {
                message: {
                    type: String,
                    required: true
                },
                read: {
                    type: Boolean,
                    required: true
                },
                timestamp: {
                    type: Date,
                    default : Date.now
                }
            }
        ],
        default : []
    }
},{timestamps : true});

module.exports = mongoose.model('user', UserSchema);