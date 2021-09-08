const Sequelize = require('sequelize');
const sequelize = require('../db');

const teachers = sequelize.define('teachers', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },

    name: {
        type: Sequelize.STRING(10),
        allowNull: true,
    },
},
{
    freezeTableName: true,
    timestamps: false,
});

module.exports = teachers;
