const BadRequestError = require('../Errors/Bad-Request-Error');
const NotFoundError = require('../Errors/Not-Found-Error')
const UnauthorizedError = require('../Errors/UnAuthorized-Error')
const errorHandler = (err, req, res, next) => {
    if (err instanceof NotFoundError) {
        res.status(err.statusCode).json(err.serializeErrors())
    }

    if (err instanceof BadRequestError) {
        res.status(err.statusCode).json(err.serializeErrors())
    }

    if(err instanceof UnauthorizedError) {
        res.status(err.statusCode).json(err.serializeErrors())
    }
}

module.exports = errorHandler;