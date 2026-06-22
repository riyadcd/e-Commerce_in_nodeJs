const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const User = sequelize.define('user',{
    id:{
        type : Sequelize.INTEGER,
        autoIncrement : true,
        allowNull : false,
        primaryKey : true
    },
    userName:{
        type : Sequelize.STRING,
        allowNull : false,
    },
    email:{
        type : Sequelize.TEXT,
        allowNull : false,
    },
    password:{
        type: Sequelize.STRING,
        allowNull: false
    },
    resetToken:{
        type : Sequelize.STRING,
    },
    resetTokenExpiration:{
        type:Sequelize.DATE
    }
});

module.exports = User;