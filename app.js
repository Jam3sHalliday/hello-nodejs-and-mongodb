const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/error.controller');

const app = express();

// set security http headers
app.use(helmet());

// body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// serving static files
app.use(express.static(`${__dirname}/public`))

// development logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// data sanitization against nosql query injection
app.use(mongoSanitize());

// prevent parameter pollution
app.use(hpp({
    whitelist: ['duration']
}));

// data sanitization against xss
app.use(xss());
// limit requests
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests!'
});

app.use('/api', limiter);

const tourRouter = require('./routes/tours.routes');
const userRouter = require('./routes/users.routes');
const reviewRouter = require('./routes/review.routes');

app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`));
});

app.use(globalErrorHandler);

module.exports = app;