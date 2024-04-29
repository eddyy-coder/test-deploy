const AWS = require('aws-sdk')
const Config = require("../config/serverConfig.js");
const asyncWrapper = require('../middleware/asyncWrapper.js');
const uuid = require('uuid').v4;

const config = new Config()


exports.uploadPhoto = asyncWrapper(async (req, res, next) => {

  const s3 = new AWS.S3({
    credentials: {
      accessKeyId: config.awsAccessKeyId,
      secretAccessKey: config.awsSecretAccessKey,
    },
  })

  let myFile = req.file.originalname.split(".")
  const fileType = myFile[myFile.length - 1]

  const params = {
    Bucket: config.awsBucketName,
    Key: `${uuid()}.${fileType}`,
    Body: req.file.buffer
  }

  s3.upload(params, async (error, data) => {
    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload photo",
        data: {},
        error: error.message,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Successfully uploaded profile photo",
      data: data.Location || "",
      error: {},
    });
  })

});