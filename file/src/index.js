const express = require("express")
const app = express()
const cors = require("cors")
const bodyParser = require('body-parser')
const multer = require('multer')
const path = require('path')

app.use(bodyParser.json())
app.use(cors())

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, path.join(__dirname, '/files/'))
//     },
//     filename: function (req, file, cb) {
//         cb(null, new Date().toISOString() + file.originalname)
//     }
// })

// const upload = multer({ storage: storage })
const upload = multer({ dest: './uploads/' })

app.post('/api/files/upload', upload.single('file'), (req, res) => {
    console.log("truy van thanh cong", req.file);
    res.status(200).json({
        message: "phan hoi thanh cong",
        data: req.file
    })
})

app.listen(4005, () => {
    console.log("listening on port 4005");
})