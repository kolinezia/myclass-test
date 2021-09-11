const express = require('express');

const lessonsController = require('../controllers/lessons.controller');

const router = express.Router();

router
    .route('/')
    .get(lessonsController.getByParams);

router
    .route('/lessons')
    .post(lessonsController.createLessons);

module.exports = router;
