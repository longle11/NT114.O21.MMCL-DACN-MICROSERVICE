class NotFoundError extends Error {
    statusCode = 404

    constructor(message) {
        super(message)

        Object.setPrototypeOf(this, NotFoundError.prototype)
    }

    serializeErrors() {
        return { message: this.message, statusCode: this.statusCode }
    }
}

module.exports = NotFoundError