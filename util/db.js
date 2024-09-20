require('dotenv').config();

const Sequelize = require('sequelize')
const sequelize = new Sequelize(process.env.DBASE_NAME,process.env.DBASE_USERNAME, process.env.DBASE_PASSWORD ,{dialect : 'mysql', host :process.env.DBASE_HOST}) // instance of Sequelize

module.exports= sequelize;