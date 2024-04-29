const express = require("express");
const {
    uploadPhoto
} = require("../controllers/list.js");
const ensureAuthenticated = require("../middleware/authMiddleware.js");
const { upload } = require("../utils/multer.js");

const router = express.Router();



router.post("/upload-photo", ensureAuthenticated, upload, uploadPhoto);


module.exports = router;