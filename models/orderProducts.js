const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const OrderProducts = sequelize.define('orderProducts',{
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

module.exports = OrderProducts;