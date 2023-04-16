const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    review:{
        type: String,
        required: [true, 'Review cannot be empty'],
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour'],
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user'],
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

ReviewSchema.pre(/^find/, function (n) {
    this.populate({
        path: 'user',
        select: 'name photo',
    });
    // .populate({
    //     path: 'tour',
    //     select: 'name'
    // });
    
    n();
});

const Review = new mongoose.model('Review', ReviewSchema);

module.exports = Review;