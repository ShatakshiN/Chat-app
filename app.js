const http = require('http');
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const bodyparser = require('body-parser');
const sequelize = require('./util/db');

require('dotenv').config();

app.use(cors());
app.use(bodyparser.json());

const Users = require('./models/user');
const { Sequelize } = require('sequelize');

function isStrValid(str) {
    return (str === undefined || str.length === 0);
};

router.post('/signUp', async (req, res, next) => {
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
            await Users.create({ name, email, passWord: hash , contactNo });
        });

        return res.status(201).json({ msg: "sign up successful" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

sequelize.sync()
    .then(()=>{
        app.listen(process.env.PORT || 4000)
        console.log('server is running on 4000')

    })
    .catch((error)=>{
        console.log(error);
    });