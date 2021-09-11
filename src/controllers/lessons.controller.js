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
        if (lessons !== false) {
            res.json(lessons);
        } else {
            res.status(400).json({ message: 'incorrect params' });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message ? error.message : error,
        });
    }
};

module.exports.createLessons = async (req, res) => {
    try {
        
        res.status(400).json({});
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message ? error.message : error,
        });
    }
};
