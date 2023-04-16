const { catchAsync } = require("../utils/functions");
const AppError = require('../utils/appError');

exports.deleteOne = Model => catchAsync(async (req, res, n) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) return n(new AppError('No document found with that ID', 400));

    return res.status(204).json({
        status: 'success',
        data: null,
    })
})

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!doc) return next(new AppError('No document found with that ID', 400));

    return res.status(200).json({
        status: 'success',
        data: doc,
    })
})

exports.createOne = Model => catchAsync(async (req, res) => {
    const doc = await Model.create(req.body);

    return res
        .status(201)
        .json({
            status: "success",
            data: doc,
        })
});


exports.getOne = (Model, options) => catchAsync(async (req, res) => {
    let query = Model.findById(req.params.id)

    if (options) query.populate('reviews');

    const doc = await query;

    if (!doc) return next(new AppError('No doc found with that ID', 400));

    return res
        .status(200)
        .json({
            status: "success",
            data: doc,
        })

});
