const User = require('../models/users.model');
const { catchAsync } = require('../utils/functions');

const getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();
    
    if (users) {
        res.status(200)
            .json({
                status: 'success',
                data: {
                    users
                }
            })
    } else {
        res
            .status(500)
            .json({
                status: 'error'
            })
    }
})

const createUser = (req, res, next) => {
    res
        .status(500)
        .json({
            status: 'error',
            message: 'This route is undefined'
        })
}

const getUser = (req, res, next) => {
    res
        .status(500)
        .json({
            status: 'error',
            message: 'This route is undefined'
        })
}

const updateUser = (req, res, next) => {
    res
        .status(500)
        .json({
            status: 'error',
            message: 'This route is undefined'
        })
}

const deleteUser = (req, res, next) => {
    res
        .status(500)
        .json({
            status: 'error',
            message: 'This route is undefined'
        })
}

module.exports = { createUser, deleteUser, getAllUsers, getUser, updateUser };
