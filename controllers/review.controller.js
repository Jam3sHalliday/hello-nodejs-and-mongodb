const { catchAsync } = require('../utils/functions');
const Review = require('../models/review.model');

exports.getAllReview = catchAsync(async (req, res, n) => {
    const reviews = await Review.find();

    res.status(200)
        .json({
            status: 'success',
            data: { reviews },
        })
});

exports.createReview = catchAsync(async (req, res, n) => {
    const {
        review,
        rating,
        createdAt,
        tour,
        user,
    } = req.body;

    const newReview = await Review.create({ review, rating, createdAt, tour, user });

    res.status(201)
        .json({
            status: 'success',
            data: { newReview },
        })
});