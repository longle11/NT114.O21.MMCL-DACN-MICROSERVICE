const jwt = require('jsonwebtoken')
const userModel = require('../models/users')
const currentUserMiddleware = async (req, res, next) => {
    try {
        if(req.session.jwt) {
            const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY)

            const isExistedUser = await userModel.findById(payload.id)
            if(isExistedUser) {
                req.currentUser = payload
            }
        }
    }catch(error) {
        
    }

    next()
}

module.exports = currentUserMiddleware