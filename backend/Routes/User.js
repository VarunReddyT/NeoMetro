const express = require('express');
const router = express.Router();
const userschema = require('../schema/UserSchema.js');
const jwt = require('jsonwebtoken');
const bycrypt = require('bcrypt');
const {Suprsend} = require("@suprsend/node-sdk");
const supr_client = new Suprsend(process.env.SUPRSEND_WORKSPACE_KEY, process.env.SUPRSEND_WORKSPACE_SECRET);

router.post('/register', async (req, res) => {
    const { name, username, password, gmail, mobilenumber } = req.body;
    if (!username || !password || !gmail || !mobilenumber || !name) {
        return res.status(400).send('Please fill all the fields');
    }

    const hashPassword = await bycrypt.hash(password, 10);

    const user = new userschema({ name, username, password : hashPassword, gmail, mobilenumber });

    const suprSendUser = supr_client.user.get_instance(username);
  
    try{
        const response = suprSendUser.save()
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
module.exports = router;
