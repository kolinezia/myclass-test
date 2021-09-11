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
            include: [
                {
                    model: models.Students,
                    through: { attributes: ['visit'] },
                    attributes: ['id', 'name'],
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
        })
        // добавление student.visit из lesson_students и visitCount
            .then((lessons) => {
                console.log(lessons);
                const newLessons = lessons.map((lesson) => {
                    let visitCount = 0;
                    const newLesson = lesson.dataValues;
                    newLesson.students.map((student) => {
                        const newStudent = student.dataValues;
                        newStudent.visit = newStudent.lesson_students.visit;
                        if (newStudent.visit === true) visitCount += 1;
                        delete newStudent.lesson_students;
                        return newStudent;
                    });
                    newLesson.visitCount = visitCount;
                    return newLesson;
                });
                return newLessons;
            });
        return result;
    }
    return false;
};
