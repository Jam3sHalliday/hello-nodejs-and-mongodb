const crypto = require('crypto');
// const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/users.model');
const { catchAsync, decodeJwt } = require('../utils/functions');
const AppError = require('../utils/appError');
const sendEmail = require('../email');
const bcrypt = require('bcryptjs');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 *60 * 1000),
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
    };

    res.cookie('jwt', token, cookieOptions);

    user.password = undefined;
    res.status(statusCode)
        .json({
            status: 'success',
            token,
        });
}

exports.signup = catchAsync(async (req, res, next) => {
    const {
        name,
        email,
        password,
        passwordConfirm,
        passwordChangedAt,
        role,
    } = req.body;

    const newUser = await User.create({
        name,
        email,
        password,
        passwordConfirm,
        passwordChangedAt,
        role,
    });

    const token = signToken(newUser._id)

    res.status(201)
        .json({
            status: 'success',
            token,
            data: {
                user: newUser,
            }
        })
})

exports.login = catchAsync(async (req, res, n) => {
    const { email, password } = req.body;

    if (!email || !password) return n(new AppError('Please provide email and password', 400));

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) return n(new AppError('Incorrect email or password', 401));

    createSendToken(user, 200, res);
})

exports.protector = catchAsync(async (req, res, n) => {
    // getting and check of it's existence
    const { authorization } = req.headers;
    let token = '';

    if (authorization && authorization.startsWith('Bearer')) {
        token = authorization.split(' ')[1];
    }

    if (!token) return n(new AppError('You are not logged in', 401))

    // verification token
    // const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    
    // check if user still exist
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) n(new AppError('The user belonging to this token is no longer exist'), 401)

    // check if user changed password after the token was issued
    if (freshUser.changedPasswordAfter(decoded.iat)) return n(new AppError('User recently change password', 401));

    // GRANT ACCESS TO THE PROTECTED ROUTE
    req.user = freshUser;
    n();
});

exports.restrictTo = (...roles) => {
    return (req, res, n) => {
        // roles ['admin', 'lead-guide'] role = 'user'
        if (!roles.includes(req.user.role)) {
            return n(new AppError('Permission denied', 403));
        }

        n();
    }
}

exports.forgotPassword = catchAsync(async (req, res, n) => {
    // get user based on POST email
    const user = await User.findOne({ email: req.body.email });
    if (!user) n(new AppError('User not found', 404));

    // generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request to your new password and password confirm to: ${resetURL}.\n If you didn't forget your password. Please ignore this email!`

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message,
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email',
        })
    } catch (err) {
        console.log(err)
        user.passwordResetExpires = undefined;
        user.passwordResetToken = undefined;
        await user.save({ validateBeforeSave: false });

        return n(new AppError('there was an error sending the email!'), 500);
    }
});

exports.resetPassword = catchAsync(async (req, res, n) => {
    // get use based on token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    // if token has not expired, && user, set new password
    if (!user) return n(new AppError('Token is invalid or expired'), 400);

    // update changedPasswordAt property for the user
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordRestExpires = undefined;

    await user.save();
    // log the user in send jwt
    createSendToken(user, 200, res);
})

exports.updatePassword = catchAsync(async (req, res, n) => {
    const { authorization } = req.headers;
    const {
        oldPassword,
        newPassword,
        newPasswordConfirm,
    } = req.body;

    const { id } = decodeJwt(authorization);

    // get user from collection
    const user = await User.findById(id).select('+password');
    if (!user) return n(new AppError('User is not exist'), 400);

    // check if POSTed current password is correct
    if (!await user.correctPassword(oldPassword, user.password)) {
        return n(new AppError('Old password is not match'), 400);
    }

    // if so -> update
    if (newPassword !== newPasswordConfirm) {
        return n(new AppError('Password confirm is not match'), 400);
    }

    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    user.save();
    // log user in, send jwt
    createSendToken(user, 200, res);
})

exports.updateMe = catchAsync(async (req, res, n) => {
    const {
        password,
        passwordConfirm,
        name,
        email,
    } = req.body;

    if (password || passwordConfirm) {
        return n(new AppError('This route is not for updating password', 400));
    }

    const user = await User.findByIdAndUpdate(
        req.user.id,
        { name, email },
        {
            new: true,
            runValidators: true,
        }
    );

    return res.status(200).json({
        status: 'success',
        data: { user }
    })
});

exports.deleteMe = catchAsync(async (req, res, n) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null,
    })
})