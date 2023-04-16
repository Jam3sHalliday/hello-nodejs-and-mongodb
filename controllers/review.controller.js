const { catchAsync, decodeJwt } = require('../utils/functions');
const Review = require('../models/review.model');
const { deleteOne, updateOne, getOne } = require('./handlerFactory');

exports.getAllReviews = catchAsync(async (req, res, n) => {
    const { tourId } = req.params;
    const reviews = await Review.find({ tour: tourId });

    res.status(200)
        .json({
            status: 'success',
            total: reviews.length || 0,
            data: { reviews },
        })
});

exports.createReview = catchAsync(async (req, res, n) => {
    const { authorization } = req.headers;
    const { tourId: tour } = req.params;
    const { id: user } = decodeJwt(authorization);
    const {
        review,
        rating,
        createdAt,
    } = req.body;
    
    const newReview = await Review.create({ review, rating, createdAt, tour, user });

    res.status(201)
        .json({
            status: 'success',
            data: { newReview },
        })
});

exports.getReview = getOne(Review);
exports.updateReview = updateOne(Review);
exports.deleteReview = deleteOne(Review);
