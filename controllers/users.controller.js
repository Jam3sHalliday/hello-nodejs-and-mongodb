const User = require('../models/users.model');
const { catchAsync } = require('../utils/functions');
const { deleteOne, updateOne, getOne } = require('./handlerFactory');

const getMe = (req, res, n) => {
    req.params.id = req.user.id;
    n();
};


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

const getUser = getOne(User);
const updateUser = updateOne(User);
const deleteUser = deleteOne(User);

module.exports = { createUser, deleteUser, getAllUsers, getUser, updateUser, getMe };
