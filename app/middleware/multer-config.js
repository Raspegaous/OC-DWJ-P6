const multer = require('multer');

const mimeTypes = {
    "image/jpg": "jpg",
    "image/jpeg": "jpg",
    "image/png": "png",
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "images");
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const ext = mimeTypes[file.mimeType];
        callback(null, `${name + Date.now()}.${ext}`);
    }
});

module.exports = multer({ storage }).single('image');