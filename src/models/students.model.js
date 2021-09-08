const Sequelize = require('sequelize');
const sequelize = require('../db');

const students = sequelize.define('students', {
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

module.exports = students;
