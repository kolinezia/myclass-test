const lessonsService = require('../services/lessons.service');

module.exports.getByParams = async (req, res) => {
    try {
        const params = {};
        if (req.query.date) params.date = req.query.date.split(',');
        if (req.query.status) params.status = req.query.status;
        if (req.query.teacherIds) params.teacherIds = req.query.teacherIds.split(',');
        if (req.query.studentsCount) params.studentsCount = req.query.studentsCount.split(',');
        if (req.query.page) params.page = req.query.page;
        if (req.query.lessonsPerPage) params.lessonsPerPage = req.query.lessonsPerPage;

        const lessons = await lessonsService.getLessonsByParams(params);
        res.json(lessons);
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            name: error.name ? error.name : 'LessonsService Error',
            message: error.message ? error.message : error,
        });
    }
};

module.exports.createLessons = async (req, res) => {
    try {
        const body = {};
        if (req.body.teachersIds) body.teachersIds = req.body.teachersIds;
        if (req.body.title) body.title = req.body.title;
        if (req.body.days) body.days = req.body.days;
        if (req.body.firstDate) body.firstDate = req.body.firstDate;
        if (req.body.lessonsCount) body.lessonsCount = req.body.lessonsCount;
        if (req.body.lastDate) body.lastDate = req.body.lastDate;

        const lessonsIds = await lessonsService.createLessons(body);
        res.status(400).json(lessonsIds);
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            name: error.name ? error.name : 'LessonsService Error',
            message: error.message ? error.message : error,
        });
    }
};
