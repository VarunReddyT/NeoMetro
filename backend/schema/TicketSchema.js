const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TicketSchema = new Schema({
    username : {
        type: String,
        required: true
    },
    source : {
        type: String,
        required: true
    },
    destination : {
        type: String,
        required: true
    },
    tickets : {
        type: Number,
        required: true
    },
    fare : {
        type: Number,
        required: true
    },
    distance : {
        type: Number,
        required: true
    },
    transactionTime : {
        type: Date,
        default: Date.now
    },
    transactionId : {
        type: String,
        required: true
    },
    paymentMode : {
        type: String,
        required: true
    },
    qrCode : {
        type : String,
        required : true
    },
    journeyDate:{
        type : Date,
        required : true
    }
});

module.exports = mongoose.model('ticket', TicketSchema);