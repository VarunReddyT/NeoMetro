const express = require('express');
const router = express.Router();
const ticketschema = require('../schema/TicketSchema.js');
// const jwt = require('jsonwebtoken');

router.post('/bookedticket', async (req, res) => {
    const { username, source, destination, tickets, fare, distance, transactionId, paymentMode, qrCode, journeyDate } = req.body;
    if (!username || !source || !destination || !tickets || !fare || !distance || !transactionId || !qrCode || !paymentMode || !journeyDate) {
        return res.status(400).send('Please fill all the fields');
    }

    const ticket = new ticketschema({
        username: username,
        source: source,
        destination: destination,
        tickets: tickets,
        fare: fare,
        distance: distance,
        transactionId: transactionId,
        paymentMode: paymentMode,
        qrCode: qrCode,
        journeyDate: journeyDate
    });
    try {
        await ticket.save();
        res.status(200).send('Ticket booked successfully');
    }
    catch (err) {
        res.status(500).send('Error booking ticket. Please try again.');
    }

}

);


router.get('/getticket', async (req, res) => {
    const { username } = req.query;
    if (!username) {
        return res.status(400).send('Please fill all the fields');
    }
    const tickets = await ticketschema.find({ username }).sort({ journeyDate: -1 });

    if (!tickets) {
        return res.status(400).send('No tickets found');
    }
    try {
        res.send(tickets);
    }
    catch (err) {
        res.status(500).send('Error fetching ticket. Please try again.');
    }
}
);


module.exports = router;