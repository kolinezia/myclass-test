const Sequelize = require('sequelize');
const sequelize = require('../db');

const lessonTeachers = sequelize.define('lesson_teachers', {
    lesson_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },

    teacher_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
},
{
    freezeTableName: true,
    timestamps: false,
});

module.exports = lessonTeachers;
