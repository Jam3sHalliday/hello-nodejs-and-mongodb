const express = require('express');
const {
    getAllReview, createReview
} = require('../controllers/review.controller');
const {
    protector,
    restrictTo,
} = require('../controllers/auth.controller');

const r = express.Router();

r
    .route('/')
    .get(getAllReview)
    .post(protector, restrictTo('user'), createReview)

module.exports = r;
