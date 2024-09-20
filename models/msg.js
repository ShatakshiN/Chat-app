const Sequelize = require('sequelize');
const sequelize = require('../util/db');
const { type } = require('os');

const Msg = sequelize.define('msg',{
    id : {
        type : Sequelize.INTEGER,
        allowNull : false,
        primaryKey : true,
        autoIncrement : true
    },

    message :{
        type : Sequelize.STRING,
        allowNull:false
    },
    senderName: {  // Adding senderName to store the user's name
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Msg;