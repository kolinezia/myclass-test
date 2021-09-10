const Sequelize = require('sequelize');
const sequelize = require('../db');

const lessons = sequelize.define('lessons', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },

    date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
    },

    title: {
        type: Sequelize.STRING(100),
        allowNull: true,
    },

    status: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
},
{
    freezeTableName: true,
    timestamps: false,
});

module.exports = lessons;
