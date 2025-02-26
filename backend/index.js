require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');  
const cors = require('cors');
const userRoutes = require('./Routes/User.js'); 
const ticketRoutes = require('./Routes/Ticket.js');
const chatRoutes = require('./Routes/Chat.js');
const stripeRoutes = require('./Routes/Stripe.js');
const subsIdRoutes = require('./Routes/SubsId.js');
const mongoose = require('mongoose');

const app = express();
const port = 4000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.log('Error connecting to MongoDB', err);
}
);

app.get('/', (req, res) => {
    res.send('Welcome to Hyderabad Metro');
}
);

app.use('/api/users', userRoutes); 
app.use('/api/tickets', ticketRoutes);
app.use('/api/chat',chatRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/subsid', subsIdRoutes);


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
