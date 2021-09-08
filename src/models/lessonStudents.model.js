const Sequelize = require('sequelize');
const sequelize = require('../db');

const lessonStudents = sequelize.define('lesson_students', {
    lesson_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },

    student_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },

    visit: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
    },
},
{
    freezeTableName: true,
    timestamps: false,
});

module.exports = lessonStudents;
