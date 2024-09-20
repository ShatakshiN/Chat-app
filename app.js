const http = require('http');
const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const bodyparser = require('body-parser');
const sequelize = require('./util/db');

require('dotenv').config();

app.use(cors());
app.use(bodyparser.json());

const Users = require('./models/user');
const Msg = require('./models/msg');
const { Sequelize } = require('sequelize');

function isStrValid(str) {
    return (str === undefined || str.length === 0);
};

app.post('/signUp', async (req, res, next) => {
    try {
        const { name, email, password, contactNo } = req.body;
        console.log('backend', { name, email, password, contactNo });

        if (isStrValid(email) || isStrValid(name) || isStrValid(password) || isStrValid(contactNo)) {
            return res.status(400).json({ err: "bad parameter" });
        }

        // Check if the email already exists
        const existingUser = await Users.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "user already exists" });
        }

        bcrypt.hash(password, 10, async (error, hash) => { 
            await Users.create({ name, email, passWord: hash , contact: contactNo });
        });

        return res.status(201).json({ msg: "sign up successful" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

function generateAccessToken(id) {
    return jwt.sign({ userId: id }, process.env.JWT_SECRET);
};

app.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (isStrValid(email) || isStrValid(password)) {
            return res.status(400).json({ message: "bad parameters" });
        }

        const loginCredentials = await Users.findAll({ where: { email } });

        if (loginCredentials.length > 0) {
            bcrypt.compare(password, loginCredentials[0].passWord, (err, result) => {
                if (err) {
                    res.status(500).json({ msg: "something went wrong" });
                }
                if (result === true) {
                    res.status(200).json({ msg: "user logged in successfully", token: generateAccessToken(loginCredentials[0].id) });
                } else {
                    return res.status(400).json({ msg: 'password incorrect' });
                }
            });
        } else {
            return res.status(404).json({ msg: "user doesn't exist" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

async function authenticate(req,res,next) {
    try {
        const token = req.header('Authorization');
        console.log(token);
        
        if (!token) {
            throw new Error('Authorization token missing');
        }
        
        const user = jwt.verify(token, process.env.JWT_SECRET);
        console.log(user.userId);

        const foundUser = await Users.findByPk(user.userId); // Wait for the user lookup
        if (!foundUser) {
            throw new Error('User not found'); // Handle if user is not found
        }

        console.log(JSON.stringify(foundUser));
        req.user = foundUser; // Assign the user to the request for global use
        next();
    } catch (err) {
        console.log(err);
        return res.status(401).json({ success: false });
    }

} ;

app.post('/chat', authenticate, async(req,res,next)=>{
    try{
        const {msg} = req.body;

        const chatData = await Msg.create({
            message : msg,
            senderName: req.user.name,
            SignUpId: req.user.id

        })
        res.status(201).json({ msgg: chatData });

    }catch (error) {
        res.status(500).json({ message: error });
    }
});


Msg.belongsTo(Users, { constraints: true, onDelete: 'CASCADE' });
Users.hasMany(Msg);

sequelize.sync()
    .then(()=>{
        app.listen(process.env.PORT || 4000)
        console.log('server is running on 4000')

    })
    .catch((error)=>{
        console.log(error);
    });