const express = require("express")

const router = express.Router()
router.post("/logout", (req, res) => {
    req.session = null
    res.status(200).send({ currentUser: null })
})

module.exports = router