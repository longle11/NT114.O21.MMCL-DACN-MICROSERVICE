const express = require("express")
const app = express()
const cors = require("cors")
const bodyParser = require('body-parser')
const multer = require('multer')
const path = require('path')
const mongoose = require("mongoose")
const fileModel = require("./models/fileModel")
const fs = require('fs');
app.use(bodyParser.json())
app.use(cors())

app.use('/api/files/uploads', express.static(path.join(__dirname, 'uploads')))

async function connectToMongoDb() {
    try {
        await mongoose.connect("mongodb://file-mongo-srv:27017/db")

        console.log('Connected successfully to database')
    } catch (err) {
        console.log('Connected failed to database')
        process.exit(1)
    }
}

connectToMongoDb()

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "uploads"))
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname)
    }
})
const upload = multer({ storage: storage })
// const upload = multer({ dest: './uploads/' })
app.post('/api/files/upload', upload.single('file'), async (req, res) => {
    const data = await fileModel.create({
        fileName: req.file.filename,
        size: req.file.size,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        creator: req.body.creator_id
    })
    res.status(200).json({
        message: "phan hoi thanh cong",
        data: data
    })
})
app.post('/api/files/issues', async (req, res) => {
    try {
        const data = await fileModel.find({ _id: { $in: req.body.file_list } })
            
        res.status(200).send({
            message: "Successfully get all files in issue",
            data: data
        })
    } catch (error) {
        console.log(error);

    }
})

app.get('/api/files/all', async (req, res) => {
    try {
        const data = await fileModel.find({})
        res.status(200).send({
            message: "Successfully get all files",
            data: data
        })
    } catch (error) {
        console.log(error);
    }
})

app.delete('/api/files/delete/:fileId', async (req, res, next) => {
    try {
        const isFileExisted = await fileModel.findById(req.params.fileId)
        if(isFileExisted) {
            //before delete file in db we should unmount link in uploads 
            fs.unlink(path.join(__dirname, `uploads/${isFileExisted.fileName}`), (err) => {
                if (err) {
                  console.error(`Error deleting file: ${err.message}`);
                  return;
                }
                console.log('File deleted successfully');
              });
            const deleteFile = await fileModel.deleteOne({_id: req.params.fileId})
            return res.status(200).json({
                message: "Successfully deleted file",
                data: deleteFile
            })
        }

        return res.status(400).json({
            message: "File is not existed"
        })
    }catch(error) {
        next(error)
    }
})
app.listen(4008, () => {
    console.log("listening on port 4008");
})