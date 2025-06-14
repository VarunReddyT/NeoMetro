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
    },
    metroPass: {
        type: {
            qrCode: {
                type: String,
                required: true,
            },
            validFrom: {
                type: Date,
                required: true,
            },
            validTo: {
                type: Date,
                required: true,
            },
            passType: {
                type: String,
                enum: ['monthly', 'quarterly'],
                required: true,
            }
        },
        default: null,
    }
},{timestamps : true});

module.exports = mongoose.model('user', UserSchema);