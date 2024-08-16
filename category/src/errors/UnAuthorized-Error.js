class UnauthorizedError extends Error {
    statusCode = 401

    constructor(message) {
        super(message)

        Object.setPrototypeOf(this, UnauthorizedError.prototype)
    }

    serializeErrors() {
        return { message: this.message, statusCode: this.statusCode }
    }
}

module.exports = UnauthorizedError