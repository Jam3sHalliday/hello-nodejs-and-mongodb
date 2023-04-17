const express = require('express');

const {
    signup,
    login,
    forgotPassword,
    resetPassword,
    updatePassword,
    protector,
    updateMe,
    deleteMe,
    restrictTo,
} = require('../controllers/auth.controller');
const {
    createUser,
    deleteUser,
    getAllUsers,
    getUser,
    updateUser,
    getMe,
} = require('../controllers/users.controller');

const r = express.Router();

r.post('/signup', signup);
r.post('/login', login);
r.post('/forgot-password', forgotPassword);
r.patch('/reset-password/:token', resetPassword);

r.use(protector);

r.get('/me', getMe, getUser)
r.patch('/update-password/', updatePassword);
r.patch('/update-me/', updateMe);
r.delete('/delete-me', deleteMe);

r.use(restrictTo('admin'));

r
    .route('/')
    .get(getAllUsers)
    .post(createUser);

r
    .route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser)

module.exports = r;
