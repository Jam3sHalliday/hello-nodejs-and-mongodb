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
    getToursWithin,
    getDistances,
} = require('../controllers/tours.controller');
const reviewRouter = require('./review.routes');

const r = express.Router();

r.route('/stats', restrictTo('admin', 'lead-guide', 'guide')).get(getTourStats);
r.route('/monthly-plan/:year').get(getMonthlyPlan);

r.use('/:tourId/reviews', reviewRouter);
 
r
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(getToursWithin)

r
    .route('/distances/:latlng/unit/:unit')
    .get(getDistances)

r
    .route('/')
    .get(getAllTours)
    .post(protector, restrictTo('lead-guide', 'admin'), createTour);


r
    .route('/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(protector, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = r;