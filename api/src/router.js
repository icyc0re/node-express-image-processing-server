const router = require('express').Router();
const multer = require('multer');
const path = require('path');

const photoPath = path.resolve(__dirname, '../../client/photo-viewer.html');

const storage = multer.diskStorage({
    destination: 'api/uploads/',
    filename
});

const upload = multer({ fileFilter, storage });

router.post('/upload', upload.single('photo'), (request, response) => {
    if (request.hasOwnProperty('fileValidationError')) {
        response.status(400).json({ error: request.fileValidationError });
    } else {
        response.status(201).json({ success: true });
    }
});

router.get('/photo-viewer', (request, response) => {
    response.sendFile(photoPath);
});

function filename(request, file, callback) {
    callback(null, file.originalname);
}

function fileFilter(request, file, callback) {
    if (file.mimetype !== 'image/png') {
        request.fileValidationError = 'Wrong file type';
        callback(null, false, new Error('Wrong file type'));
    } else {
        callback(null, true);
    }
}

module.exports = router;
