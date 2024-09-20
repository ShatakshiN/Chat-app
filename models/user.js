const Sequelize = require('sequelize');
const sequelize = require('../util/db');

const Users  = sequelize.define('SignUp',{
    id : {
        type : Sequelize.INTEGER,
        allowNull : false,
        primaryKey : true,
        autoIncrement : true
    },

    name : {
        type : Sequelize.STRING,
        allowNull : false  
    },

    email : {
        type : Sequelize.STRING,
        allowNull : false,
        unique: true
    },

    passWord: {
        type : Sequelize.STRING,
        allowNull :false
        
    },
    
    contact: {
        type : Sequelize.INTEGER,
        allowNull : false

    }
});

module.exports = Users;