const http = require('http');
const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const bodyparser = require('body-parser');
const sequelize = require('./util/db');
const { Op } = require('sequelize');


require('dotenv').config();

app.use(cors());
app.use(bodyparser.json());

const Users = require('./models/user');
const Msg = require('./models/msg');
const Group = require('./models/group');
const Member = require('./models/member');
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
        const token = req.header('auth-token');
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

app.get('/user/all-users', authenticate, async (req, res, next) => {
    try {
        const users = await Users.findAll();
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* app.get('/message/get-messages', authenticate, async (req, res, next) => {
    try {
        const id = req.query.id;
        const result = await Msg.findAll({where :{
            id : {
                [Op.gt] : id
            }
        }});
        
        return res.json({success : true , messages : result , id : req.user.id})
    } catch (e) {
        console.log(e)
        return res.status(500).json({ success: false, msg: "Internal server error" })

    }

});
 */

/* app.post('message/add-message', authenticate, async(req,res,next)=>{
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
 */

/* app.post('/message/add-message', authenticate, async (req, res, next) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message content cannot be empty" });
        }

        const newMessage = await Msg.create({
            message: message,
            senderName: req.user.name,
            SignUpId: req.user.id
        });

        res.status(201).json({ msg: "Message sent", message: newMessage });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}); */

app.post('/createGroup', authenticate, async(req,res,next)=>{
    try{
        const name = req.body.groupName;
        const {members, admins} = req.body;
        // console.log(req.user.name)
       const group  =await Group.create({name : name , admin : true})
       //const member = await req.user.addGroup(group , {through : {admin : true}})

       //return res.json({group , member})
        // Add the current user as admin
        await req.user.addGroup(group, { through: { admin: true } });

        // Add selected members to the group
        for (const memberId of members) {
            const member = await Users.findByPk(memberId);
            await member.addGroup(group, { through: { admin: admins.includes(memberId) } });
        }

        return res.json({ success: true, group });
    }catch(e){
        console.log(e)
        return res.status(500).json({success : false , msg :"Internal server error"})
    }
})

app.get('/groups', authenticate, async (req, res) => {
    try {
        const groups = await req.user.getGroups();  // Get groups for the logged-in user
        res.json({ success: true, groups });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, msg: "Failed to fetch groups" });
    }
});

app.get('/groups/:groupId/members', authenticate, async (req, res) => {
    try {
        const groupId = req.params.groupId;

        //Step 1: Get all `SignUpId` from `members` where `groupId` matches
        const signUpIds = await Member.findAll({
        attributes: ['SignUpId'],
        where: {
            groupId: groupId
        }
        });
        // Extracting the ids into an array
        const signUpIdsArray = signUpIds.map(member => member.SignUpId);

        // Step 2: Get the `name` from `signups` where `id` is in the array
        const signups = await Users.findAll({
        attributes: ['name'],
        where: {
            id: {
            [Op.in]: signUpIdsArray
            }
        }
        });


        if (!signups) {
            return res.status(404).json({ success: false, msg: 'Group not found' });
        }
        res.json({ success: true, signups });
    } catch (error) {
        console.error('Error fetching group members:', error);
        res.status(500).json({ success: false, msg: 'Failed to fetch group members' });
    }
});


app.post('/groups/:groupId/send-message', authenticate, async (req, res) => {
    try {
        const { content } = req.body;
        const groupId = req.params.groupId;
        const userId = req.user.id;

        // Save the message
        const newMessage = await Msg.create({
            message: content, // Assuming your model has 'message'
            senderName: req.user.name, 
            groupId,
            memberId: userId
        });

        res.json({ success: true, message: newMessage });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, msg: 'Failed to send message' });
    }
});


app.get('/groups/:groupId/recent-messages', authenticate, async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const messages = await Msg.findAll({
            where: { groupId },
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        // Fetch the group details
        const group = await Group.findOne({
            where: { id: groupId },
            attributes: ['name'] // Adjust this if your group model has different fields
        });

        if (!group) {
            return res.status(404).json({ success: false, msg: 'Group not found' });
        }


        // Check if the current user is an admin in the group
        const member = await Member.findOne({
            where: { SignUpId: req.user.id, groupId },
            attributes: ['admin']

        });

        const isAdmin = member ? member.admin : false;

        res.json({ success: true, messages, groupName: group.name, isAdmin });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, msg: 'Failed to fetch messages' });
    }
});





Users.belongsToMany(Group , {through : Member})
Group.belongsToMany( Users, {through : Member})

Group.hasMany(Msg)
Msg.belongsTo(Group)

Member.hasMany(Msg)
Msg.belongsTo(Member)



sequelize.sync()
    .then(()=>{
        app.listen(process.env.PORT || 4000)
        console.log('server is running on 4000')

    })
    .catch((error)=>{
        console.log(error);
    });