const Tour = require('../models/tours.model');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const { catchAsync } = require('../utils/functions');
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

const aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.limit = '-ratingAverage,price';
    req.query.limit = 'name, price,ratingsAverage,summary,difficulty';
    next();
}

const getAllTours = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .filter()
        .limitFields()
        .paginate();

    const tours = await features.query;

    return res
        .status(200)
        .json({
            status: 'success',
            length: tours.length,
            data: { tours },
        });
});

const createTour = catchAsync(async (req, res) => {
    const newTour = await Tour.create(req.body);

    return res
        .status(201)
        .json({
            status: "success",
            data: newTour,
        })
});

const getTour = catchAsync(async (req, res) => {
    // const tour = await Tour.find({ _id: req.params.id });
    const tour = await Tour.findById(req.params.id).populate('reviews');
    if (!tour) return next(new AppError('No tour found with that ID', 400));

    return res
        .status(200)
        .json({
            status: "success",
            data: tour,
        })

});

const updateTour = catchAsync(async (req, res) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!tour) return next(new AppError('No tour found with that ID', 400));

    return res.status(200).json({
        status: 'success',
        data: tour,
    })
})

const deleteTour = catchAsync(async (req, res) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) return next(new AppError('No tour found with that ID', 400));

    return res.status(204).json({
        status: 'success',
        data: null,
    })
})

const getTourStats = catchAsync(async (req, res) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            }
        },
        {
            $sort: { numTours: -1 }
        },
    ]);


    return res.status(200).json({
        status: 'success',
        data: stats,
    })
})

const getMonthlyPlan = catchAsync(async (req, res) => {
    const year = +req.params.year;

    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates',
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: {
                _id: 0,
            },
        },
        {
            $sort: { numTourStarts: -1 }
        },
        {
            $limit: 3
        }
    ]);

    res.status(200).json({
        status: 'success',
        total: plan.length,
        data: {
            plan
        }
    })
})

module.exports = {
    createTour,
    getTour,
    getAllTours,
    updateTour,
    deleteTour,
    getTourStats,
    getMonthlyPlan,
}