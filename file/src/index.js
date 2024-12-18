const express = require("express")
const app = express()
const cors = require("cors")
const bodyParser = require('body-parser')
const multer = require('multer')
const mongoose = require("mongoose")
const fileModel = require("./models/fileModel")
const Minio = require('minio');
app.use(bodyParser.json())
app.use(cors())

const minioClient = new Minio.Client({
    endPoint: '192.168.73.110',
    port: 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY_ID,
    secretKey: process.env.MINIO_SECRET_KEY_ID
});

// app.use('/api/files/uploads', express.static(path.join(__dirname, 'uploads')))


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

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, path.join(__dirname, "uploads"))
//     },
//     filename: function (req, file, cb) {
//         cb(null, new Date().toISOString() + file.originalname)
//     }
// })

// const upload = multer({ storage: storage })
// const upload = multer({ dest: './uploads/' })

// Cấu hình multer để nhận file
const storage = multer.memoryStorage(); // Lưu file trong bộ nhớ tạm thời
const upload = multer({ storage: storage }).single('file');

app.post('/api/files/upload', upload, async (req, res) => {
    if (!req.file) {
        return res.status(400).json('No file uploaded.');
    }
    const bucketName = 'taskscheduler-files-storage'
    const data = await fileModel.create({
        size: req.file.size,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        creator: req.body.creator_id,
    })
    await minioClient.putObject(bucketName, data._id + '-' + req.file.originalname, req.file.buffer, async (err, etag) => {
        if (err) {
            return res.status(500).json('Error uploading file to MinIO: ' + err);
        }
        return res.status(200).json({
            message: "phan hoi thanh cong",
            data: data
        })
    });
})

//allow to download file
app.get('/api/files/download/:fileId', async (req, res) => {
    const { fileId } = req.params;
    const fileInfo = await fileModel.findById(fileId)
    const bucketName = 'taskscheduler-files-storage'
    if (fileInfo) {
        await minioClient.presignedGetObject(bucketName, fileInfo._id + '-' + fileInfo.originalname, (err, presignedUrl) => {
            if (err) {
                return res.status(500).send(err);
            }
            return res.status(200).json({ url: presignedUrl });
        });
    } else {
        return res.status(400).json({
            message: "File is not existed",
            data: null
        })
    }
});

app.get('/api/files/:fileId/:fileName', async (req, res) => {
    const { fileId, fileName } = req.params;
    const fileInfo = await fileModel.findById(fileId)
    if (!fileInfo) {
        return res.status(400).json({
            message: "File is not existed",
            data: null
        })
    }
    const bucketName = 'taskscheduler-files-storage'
    // Sử dụng presignedGetObject để lấy URL tạm thời cho tệp
    await minioClient.presignedGetObject(bucketName, fileId + '-' + fileName, (err, presignedUrl) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.redirect(presignedUrl);
    });
});


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
        return res.status(200).send({
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
        if (isFileExisted) {
            // //before delete file in db we should unmount link in uploads 
            // fs.unlink(path.join(__dirname, `uploads/${isFileExisted.fileName}`), (err) => {
            //     if (err) {
            //         console.error(`Error deleting file: ${err.message}`);
            //         return;
            //     }
            //     console.log('File deleted successfully');
            // });
            const bucketName = 'taskscheduler-files-storage'
            await minioClient.removeObject(bucketName, isFileExisted._id + '-' + isFileExisted.originalname, async (err) => {
                if (err) {
                    return res.status(500).json('Error deleting file from MinIO: ' + err);
                }
                const deleteFile = await fileModel.deleteOne({ _id: req.params.fileId })
                return res.status(200).json({
                    message: "File deleted successfully",
                    data: deleteFile
                });
            });
        } else {
            return res.status(400).json({
                message: "File is not existed"
            })
        }
    } catch (error) {
        next(error)
    }
})
app.listen(4008, () => {
    console.log("listening on port 4008");
})