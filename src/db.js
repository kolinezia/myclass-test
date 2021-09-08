const Sequelize = require('sequelize');

const sequelize = new Sequelize('postgres://root:root@localhost:5432/myclass');

module.exports = sequelize;
