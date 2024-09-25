const Sequelize = require('sequelize');
const sequelize = require('../util/db');

const Member = sequelize.define('member', {
    id : {
        type : Sequelize.INTEGER,
        autoIncrement : true,
        primaryKey :true,
        allowNull:false
    },
    admin : {
        type : Sequelize.BOOLEAN,
        defaultValue : false
    },
    creator : {
        type : Sequelize.BOOLEAN,
        defaultValue : false
    }
});

module.exports = Member; 