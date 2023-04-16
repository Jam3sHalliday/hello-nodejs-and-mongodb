const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('../../models/tours.model');
const dotenv = require('dotenv');
dotenv.config({ path: '../../config.env' });
console.log(process.env.DB_LOCAL)

mongoose.connect(process.env.DB_LOCAL, {
    useNewUrlParser: true,
});

const tours = JSON.parse(fs.readFileSync('./tours.json', 'utf-8'));

const importData = async () => {
    await Tour.create(tours);
}

const deleteMany = async () => {
    await Tour.deleteMany();
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