const Tour = require('../models/tours.model');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const { catchAsync } = require('../utils/functions');
const { deleteOne, updateOne, createOne, getOne } = require('./handlerFactory')
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

    // const tours = await features.query.explain();
    const tours = await features.query;

    return res
        .status(200)
        .json({
            status: 'success',
            length: tours.length,
            data: { tours },
        });
});

const getTour = getOne(Tour, { path: 'reviews' });
const createTour = createOne(Tour);
const updateTour = updateOne(Tour);
const deleteTour = deleteOne(Tour);


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
});

const getToursWithin = catchAsync(async (req, res, n) => {
    const { distance, unit, latlng } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
    
    if (!lat || !lng) n(new AppError('Please provide lat and long in the format lat,lng'));
    
    const tours = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    })

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours,
        },
    })
});

const getDistances = catchAsync(async (req, res, n) => {
    const { unit, latlng } = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.0006213 : 0.001;
    
    if (!lat || !lng) n(new AppError('Please provide lat and long in the format lat,lng'));
    
    const distance = await Tour.aggregate([
        {
            // startLocation is automatically selected for key
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            },
        },
        {
            $project: {
                distance: 1,
                name: 1,
            }
        }
    ])

    res.status(200).json({
        status: 'success',
        total: distance.length, 
        data: {
            data: distance,
        },
    })
});

module.exports = {
    createTour,
    getToursWithin,
    getTour,
    getAllTours,
    updateTour,
    deleteTour,
    getTourStats,
    getMonthlyPlan,
    getDistances,
}