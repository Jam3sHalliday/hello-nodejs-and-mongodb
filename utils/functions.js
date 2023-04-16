const jwt_decode = require('jwt-decode');

exports.catchAsync = (fn) => (req, res, next) => fn(req, res, next).catch(next)

exports.decodeJwt = (authorization) => jwt_decode(authorization.split(' ')[1]);