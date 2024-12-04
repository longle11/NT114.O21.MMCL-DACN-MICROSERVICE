class BadRequestError extends Error {
    statusCode = 400

    constructor(message) {
        super(message)

        Object.setPrototypeOf(this, BadRequestError.prototype)
    }

    serializeErrors() {
        return { message: this.message, statusCode: this.statusCode }
    }
}

module.exports = BadRequestError