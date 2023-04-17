const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, 'Name is required']
    },
    email: {
        type: String,
        require: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email'],
    },
    password: {
        type: String,
        minlength: 8,
        require: [true, 'Password is required'],
        select: false,
    },
    passwordConfirm: {
        type: String,
        require: [true, 'Password confirm is required'],
        validate: {
            validator: function(el) {
                return el === this.password;
            },
            message: 'Passwords are not match'
        }
    },
    photo: String,
    passwordChangedAt: Date ,
    role: {
        type: String,
        enum: ['admin', 'user', 'lead-guide', 'guide'],
        default: 'user',
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false,
    }
});

UserSchema.pre('save', function(n) {
  if (!this.isModified('password') || this.isNew) return n ();  

  this.passwordChangedAt = Date.now() - 1000;
  n();
})

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;

    next();
});

UserSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return bcrypt.compare(candidatePassword, userPassword);
}

UserSchema.methods.changedPasswordAfter = function (jwtTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000);

        return jwtTimestamp < changedTimestamp;
    }
    
    return false; // password was not changed
}

UserSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 100;

    return resetToken;
}

UserSchema.pre(/^find/, function(n) {
    this.find({ active: { $ne: false } });
    n();
});

const User = mongoose.model('User', UserSchema)

module.exports = User;
