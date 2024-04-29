const multer = require('multer');

const storage = multer.memoryStorage({
    destination: function(req, file, callback) {
        callback(null, ''); // No destination needed for memory storage
    }
});

const upload = multer({ storage }).single('image');

module.exports = {
    upload
};
