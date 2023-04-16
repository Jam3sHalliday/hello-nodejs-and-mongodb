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
} = require('../controllers/auth.controller');
const {
    createUser,
    deleteUser,
    getAllUsers,
    getUser,
    updateUser,
    getMe,
} = require('../controllers/users.controller');

const {
    createReview,
} = require('../controllers/review.controller');

const r = express.Router();

r.post('/signup', signup);
r.post('/login', login);

r.get('/me', protector, getMe, getUser)
r.post('/forgot-password', forgotPassword);
r.patch('/reset-password/:token', resetPassword);
r.patch('/update-password/', protector, updatePassword);
r.patch('/update-me/', protector, updateMe);
r.delete('/delete-me', protector, deleteMe);


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
