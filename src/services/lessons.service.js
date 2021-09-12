/* eslint-disable no-nested-ternary */
const { Op, Sequelize } = require('sequelize');
const sequelize = require('../db');
const models = require('../models');
const validator = require('./validators/lessons.validator');
const ApiError = require('../utils/apiError');

module.exports.getLessonsByParams = async (params) => {
    const validParams = validator.getParams(params);
    if (validParams.validated) {
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
    throw new ApiError('Validation Error', 400, validParams.error);
};

module.exports.createLessons = async (body) => {
    const validParams = validator.postBody(body);
    if (validParams.validated) {
        let lessonsIds = [];
        let lessonsCount = 300;
        const lessonsArray = [];
        const teachersIds = [];

        // поиск существующих учителей
        try {
            await models.Teachers.findAll({
                attributes: ['id'],
                where: { id: { [Op.in]: body.teachersIds.map((x) => parseInt(x, 10)) } },
            }).then((ids) => {
                teachersIds.push(...ids.map((id) => id.dataValues.id));
            });
            if (!teachersIds.length) throw Error();
        } catch (err) {
            throw new ApiError('Validation Error', 400, 'These \'teachersIds\' Not Found');
        }

        // расчет количества записей по дате
        const currentDate = new Date(body.firstDate);
        const maxDate = new Date(currentDate);
        maxDate.setFullYear(currentDate.getFullYear() + 1);

        if (body.lessonsCount) {
            if (body.lessonsCount < lessonsCount) {
                lessonsCount = body.lessonsCount;
            }
        }

        if (body.lastDate) {
            const lastDate = new Date(body.lastDate);
            if (lastDate < maxDate) {
                maxDate.setDate(lastDate);
            }
        }

        // подготовка данных 'lessons'
        for (let i = 0; i < lessonsCount;) {
            if (body.days.includes(currentDate.getDay())) {
                lessonsArray.push({
                    date: currentDate.toISOString().split('T')[0],
                    title: body.title,
                    status: 0,
                });
                i++;
            }
            currentDate.setDate(currentDate.getDate() + 1);
            if (currentDate > maxDate) break;
        }

        // транзакция на сохранение уроков и учителей
        const t = await sequelize.transaction();
        try {
            await models.Lessons.bulkCreate(
                lessonsArray,
                {
                    transaction: t,
                    returning: ['id'],
                },
            ).then((lessons) => {
                lessonsIds = lessons.map((lesson) => lesson.dataValues.id);
            });

            // подготовка данных 'lesson_teachers'
            const lessonTeachersArray = [];
            lessonsIds.map((lessonId) => teachersIds.map((tId) => lessonTeachersArray.push({
                teacher_id: tId,
                lesson_id: lessonId,
            })));

            await models.LessonTeachers.bulkCreate(
                lessonTeachersArray,
                { transaction: t },
            );

            await t.commit();
        } catch (err) {
            await t.rollback();
            throw new Error(err);
        }

        return lessonsIds;
    }
    throw new ApiError('Validation Error', 400, validParams.error);
};
