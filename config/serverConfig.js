const dotenv = require('dotenv');
dotenv.config();

class Config {
    // port = process.env.PORT || '3001';
    appName = process.env.APP_NAME || "OCTOR"

    // aws s3 bucket info
    awsBucketName = process.env.AWS_BUCKET_NAME 
    awsSecretAccessKey = process.env.AWS_SECRET_KEY 
    awsBucketRegion = process.env.AWS_BUCKET_REGION 

    // aws s3 bucket info
    mail_host = process.env.EMAIL_HOST
    mail_port = process.env.EMAIL_PORT 
    mail_username = process.env.EMAIL_USER 
    mail_password = process.env.EMAIL_PASSWORD 
    mail_encryption = process.env.EMAIL_ENCRYPTION 
    mail_from = process.env.EMAIL_FROM 
}

module.exports = Config;
