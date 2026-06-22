const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const CartProducts = sequelize.define('cartProducts',{
  id: {
    type : Sequelize.INTEGER,
    autoIncrement : true,
    allowNull : false,
    primaryKey : true
  },
  quantity : {
    type: Sequelize.INTEGER
  }
});

module.exports = CartProducts;