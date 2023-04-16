const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');

// const db = process.env.DB.replace('<PWD>', process.env.DB_PW);

mongoose.connect(process.env.DB_LOCAL, {
    useNewUrlParser: true,
}).then(() => console.log('db connected! 😘'))

app.listen(process.env['PORT'], () => console.log(`Server is running on port ${process.env['PORT']}`))
 