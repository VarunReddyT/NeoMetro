const express = require('express');
const router = express.Router();
const userschema = require('../schema/UserSchema.js');
const jwt = require('jsonwebtoken');
const bycrypt = require('bcrypt');

router.post('/register', async (req, res) => {
    const { name, username, password, gmail, mobilenumber } = req.body;
    if (!username || !password || !gmail || !mobilenumber || !name) {
        return res.status(400).send('Please fill all the fields');
    }

    const hashPassword = await bycrypt.hash(password, 10);

    const user = new userschema({ name, username, password : hashPassword, gmail, mobilenumber });

  
    try{
        await user.save();
        console.log('User registered successfully');
        res.status(200).send('User registered successfully');
    }
    catch(err){
        console.log(err);
        res.status(500).send('Error registering user. Please try again.');
    }
    
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Please fill all the fields');
    }

    const user = await userschema.findOne({ username });
    if (!user) {
        return res.status(400).send('Invalid Username');
    }
    const name = user.name;

    const validPassword = await bycrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(400).send('Invalid Password');
    }


    try{
        const token = jwt.sign({ username,name }, process.env.SECRET_KEY, { expiresIn: '2h' });
        res.send({ token });
    }
    catch(err){
        res.status(500).send('Error logging in. Please try again.');
    }
}
);

router.post('/check', async (req, res) => {
    const {token} = req.body;
    if (!token) {
        return res.status(400).send('Log in.');
    }
    try{
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        if (!decoded) {
            return res.status(400).send('Invalid token');
        }
        res.status(200).send({message: 'Valid token',name: decoded.name});
    }
    catch(err){
        return res.status(400).send('Invalid token');
    }
    
}
);

router.get('/getuser', async (req, res) => {
    const {username} = req.query;
    if (!username) {
        return res.status(400).send('No user found');
    }
    const user = await userschema.findOne({username});
    if (!user) {
        return res.status(400).send('No user found');
    }
    try{
        res.send({name: user.name, username: user.username, gmail: user.gmail, mobilenumber: user.mobilenumber});
    }
    catch(err){
        res.status(500).send('Error fetching user. Please try again.');
    }
}
);

router.put(`/:username/addnotification`, async (req, res) => {
    const {username} = req.params;
    console.log(username);
    console.log(req.body);
    const {message} = req.body;
    if (!username || !message) {
        return res.status(400).send('Please fill all the fields');
    }
    try{
        const notification = {
            message,
            read: false
        };
        await userschema.updateOne({username}, {$push: {notifications: notification}});
        res.status(200).send('Notification added successfully');
    }
    catch(err){
        res.status(500).send('Error adding notification. Please try again.');
    }
}
);

router.get(`/:username/getnotifications`, async (req, res) => {
    const {username} = req.params;
    if (!username) {
        return res.status(400).send('Please fill all the fields');
    }
    const user = await userschema.findOne({username});
    if (!user) {
        return res.status(400).send('No user found');
    }
    try{
        res.send(user.notifications);
    }
    catch(err){
        res.status(500).send('Error fetching notifications. Please try again.');
    }
}
);

router.put(`/:username/markasread`, async (req, res) => {
    const {username} = req.params;
    const {notificationId} = req.body;
    if (!username || !notificationId) {
        return res.status(400).send('Please fill all the fields');
    }
    try{
        await userschema.updateOne(
            { username, 'notifications._id': notificationId },
            { $set: { 'notifications.$.read': true } } 
        );

        res.status(200).send('Notification marked as read.');
    }
    catch(err){
        res.status(500).send('Error marking notification as read. Please try again.');
    }
}
);

router.post('/:username/generatemetropass', async (req, res) => {
    const { username } = req.params;
    const { name, email, phone } = req.body;

    if (!username || !name || !email || !phone) {
        return res.status(400).send('Please provide all required fields.');
    }

    try {
        const qrCodeResponse = await axios.get("https://neo-metro-flask.vercel.app/qrcode/metropass", {
            params: { name, email },
        });
        const qrCode = qrCodeResponse.data.qrcode;
        const validFrom = new Date();
        const validTo = new Date();
        validTo.setMonth(validTo.getMonth() + 3);
        await userschema.updateOne(
            { username },
            {
                $set: {
                    metroPass: {
                        qrCode,
                        validFrom,
                        validTo,
                    },
                },
            }
        );

        res.status(200).send({ qrCode, validFrom, validTo });
    } catch (err) {
        console.error('Error generating metro pass:', err);
        res.status(500).send('Error generating metro pass. Please try again.');
    }
});

router.get('/:username/checkmetropass', async (req, res) => {
    const { username } = req.params;

    if (!username) {
        return res.status(400).send('Please provide a username.');
    }

    try {
        const user = await userschema.findOne({ username });
        if (!user) {
            return res.status(404).send('User not found.');
        }
        if (user.metroPass && new Date(user.metroPass.validTo) > new Date()) {
            return res.status(200).send(user.metroPass);
        }

        res.status(404).send('No valid metro pass found.');
    } catch (err) {
        console.error('Error checking metro pass:', err);
        res.status(500).send('Error checking metro pass. Please try again.');
    }
});
module.exports = router;
