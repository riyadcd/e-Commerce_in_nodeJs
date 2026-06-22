
const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Product = sequelize.define('product',{  //product is actually the name of the model and if table name is not define automaticallly it takes the model name if table does not exists
    id: {
        type : Sequelize.INTEGER,
        autoIncrement : true,
        allowNull : false,
        primaryKey : true  
    },
    title: {
        type : Sequelize.STRING,
        allowNull : false,
    },
    price: {
        type : Sequelize.DOUBLE,
        allowNull : false,
    },
    imageUrl: {
        type : Sequelize.STRING,
        allowNull : false,
    }
});

module.exports = Product;