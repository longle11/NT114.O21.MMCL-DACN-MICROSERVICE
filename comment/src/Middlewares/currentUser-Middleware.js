const jwt = require('jsonwebtoken')
const currentUserMiddleware = (req, res, next) => {
    try {
        if(req.session.jwt) {
            const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY)
            req.currentUser = payload
        }
    }catch(error) {
        req.currentUser = null
    }

    next()
}

module.exports = currentUserMiddleware