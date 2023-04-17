const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('../../models/tours.model');
const dotenv = require('dotenv');
const User = require('../../models/users.model');
const Review = require('../../models/review.model');
dotenv.config({ path: '../../config.env' });

mongoose.connect(process.env.DB_LOCAL, {
    useNewUrlParser: true,
});

const tours = JSON.parse(fs.readFileSync('./tours.json', 'utf-8'));
const users = JSON.parse(fs.readFileSync('./users.json', 'utf-8'));
const reviews = JSON.parse(fs.readFileSync('./reviews.json', 'utf-8'));

const importData = async () => {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    process.exit();
}

const deleteMany = async () => {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();

    process.exit();
}

if (process.argv.includes('--import') && process.argv.includes('--delete')) {
    importData();
    deleteMany();

    process.exit();
}

if (process.argv.includes('--import')) {
    importData();
}

if (process.argv.includes('--delete')) {
    deleteMany();
}