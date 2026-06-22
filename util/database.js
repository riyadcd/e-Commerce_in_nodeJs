const Sequelize = require('sequelize');

const sequelize = new Sequelize('node_complete','root','0105Aish@123',{dialect : 'mysql',host : 'localhost',port : '3306'})

// const pool = mysql.createPool({
//     host : 'localhost',
//     port : '3306',
//     user : 'root',
//     database : 'node_complete',
//     password : '0105Aish@123',
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });

module.exports = sequelize; 