const express = require('express');

const {
    protector,
    restrictTo,
} = require('../controllers/auth.controller');

const {
    createTour,
    getAllTours,
    getTour,
    updateTour,
    deleteTour,
    getTourStats,
    getMonthlyPlan,
} = require('../controllers/tours.controller');

const r = express.Router();

r.route('/stats').get(getTourStats);
r.route('/monthly-plan/:year').get(getMonthlyPlan);

r
    .route('/')
    .get(protector, getAllTours)
    .post(createTour);


r
    .route('/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(protector, restrictTo('admin', 'lead-guide'), deleteTour);


module.exports = r;