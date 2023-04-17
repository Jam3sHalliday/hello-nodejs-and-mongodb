const mongoose = require('mongoose');
const Tour = require('./tours.model');

const ReviewSchema = new mongoose.Schema({
    review: {
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

ReviewSchema.index({ tour: 1, user: 1 }, { unique: true });

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

ReviewSchema.pre(/^findOneAnd/, async function (n) {
    this.r = await this.findOne().clone();
    n();
})

ReviewSchema.post('save', function() {
    // this points to current review
    this.constructor.calcAverageRatings(this.tour)
})

ReviewSchema.post(/^findOneAnd/, function() {
    this.constructor.calcAverageRatings(this.r.tour)
})

ReviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            },
        },
    ]);

    if(stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage: stats[0].avgRating,
            ratingsQuantity: stats[0].nRating,
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage: 4.5,
            ratingsQuantity: 0,
        });
    }
}

const Review = new mongoose.model('Review', ReviewSchema);

module.exports = Review;
