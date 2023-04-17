const express = require('express');
const {
    getAllReviews,
    createReview,
    updateReview,
    getReview,
    deleteReview,
} = require('../controllers/review.controller');
const {
    protector,
    restrictTo,
} = require('../controllers/auth.controller');

const r = express.Router({ mergeParams: true });

r.use(protector);

r
    .route('/')
    .get(getAllReviews)
    .post(protector, restrictTo('user'), createReview)

r
    .route('/:id')
    .get(protector, restrictTo('user'), getReview)
    .patch(protector, restrictTo('user', 'admin'), updateReview)
    .delete(protector, restrictTo('user', 'admin'), deleteReview)

module.exports = r;
