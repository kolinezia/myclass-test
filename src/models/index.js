const Lessons = require('./lessons.model');
const LessonTeachers = require('./lessonsTeachers.model');
const LessonStudents = require('./lessonStudents.model');
const Students = require('./students.model');
const Teachers = require('./teachers.model');

Lessons.belongsToMany(Students, { through: LessonStudents, foreignKey: 'lesson_id' });
Students.belongsToMany(Lessons, { through: LessonStudents, foreignKey: 'student_id' });

Lessons.belongsToMany(Teachers, { through: LessonTeachers, foreignKey: 'lesson_id' });
Teachers.belongsToMany(Lessons, { through: LessonTeachers, foreignKey: 'teacher_id' });

module.exports = {
    Lessons,
    LessonTeachers,
    LessonStudents,
    Students,
    Teachers,
};
