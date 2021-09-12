/* eslint-disable no-nested-ternary */
const { Op, Sequelize } = require('sequelize');
const models = require('../models');

function validateParams(params) {
    if (params.date) { return true; }
    return true;
}

module.exports.getLessonsByParams = async (params) => {
    if (validateParams(params)) {
        const result = models.Lessons.findAll({
            attributes: {
                include: [[Sequelize.literal(`(SELECT COUNT(*)::INTEGER FROM lesson_students AS lesson_students  WHERE 
                lesson_students.lesson_id = "lessons"."id" AND lesson_students.visit = true)`), 'visitCount']],
            },
            include: [
                {
                    model: models.Students,
                    through: { attributes: [] },
                    attributes: {
                        include: [[Sequelize.literal('"students->lesson_students".visit'), 'visit']],
                    },
                    required: true,
                },
                {
                    model: models.Teachers,
                    through: { attributes: [] },
                    required: true,
                    where: params.teacherIds
                        ? { id: { [Op.in]: params.teacherIds.map((x) => parseInt(x, 10)) } }
                        : {},
                },
            ],
            where: {
                [Op.and]: [
                    params.status
                        ? { status: params.status }
                        : {},

                    params.date
                        ? params.date[1]
                            ? { date: { [Op.between]: params.date } }
                            : { date: { [Op.eq]: params.date[0] } }
                        : {},

                    params.studentsCount
                        ? params.studentsCount[1]
                            ? Sequelize.literal(`EXISTS (SELECT ls.lesson_id  FROM lessons l
                                JOIN lesson_students ls ON l.id = ls.lesson_id
                                WHERE ls.lesson_id = "lessons"."id"
                                GROUP BY ls.lesson_id
                                HAVING COUNT(DISTINCT ls.student_id) BETWEEN ${params.studentsCount[0]} AND ${params.studentsCount[1]})`)
                            : Sequelize.literal(`EXISTS (SELECT ls.lesson_id  FROM lessons l
                                JOIN lesson_students ls ON l.id = ls.lesson_id
                                WHERE ls.lesson_id = "lessons"."id"
                                GROUP BY ls.lesson_id
                                HAVING COUNT(DISTINCT ls.student_id) = ${params.studentsCount[0]})`)
                        : {},
                ],
            },
            order: [['date']],
            // значение 'lessonsPerPage' по умолчанию '5'
            limit: params.lessonsPerPage ? params.lessonsPerPage : 5,
            offset: params.page ? (
                +params.page === 1
                    ? 0
                    : params.lessonsPerPage
                        ? +params.lessonsPerPage * (+params.page - 1)
                        : 5 * (+params.page - 1)
            ) : 0,
        });
        return result;
    }
    return false;
};
