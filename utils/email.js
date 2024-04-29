const nodemailer = require("nodemailer");
const ejs = require("ejs");
const htmlToText = require("html-to-text");
const moment = require("moment");
const Config = require("../config/serverConfig")

const config = new Config()

const transport = nodemailer.createTransport({
  service: 'Gmail',
    auth: {
        user: 'edwynbtrocks@gmail.com', // Your email address
        pass: 'nbzj voua sbrp umcc' // Your email password
    }
});

const generateHTML = (filename, options = {}) => {
  var html = "";
  ejs.renderFile(
    `${__dirname}/../views/email/${filename}.ejs`,
    {
      mail_data: options.data,
      currentTime: moment().format("YYYY-MM-DD HH:mm:ss"),
      current: moment().format("HH:mm a"),
      one_hr_ago: moment().subtract(1, "hour").format("HH:mm a"),
    },
    {},
    (err, str) => {
      if (err) {
        console.log(err);
      } else {
        html = str;
      }
    }
  );
  return html;
};

exports.send = (options) => {
  const html = generateHTML(options.filename, options);
  // if (options.fiename == "deal_status_deactive") {
  //   html = generateHTML(options.filename, options);
  // }
  const text = htmlToText.fromString(html);
  const mailOptions = {
    from: "edwynbtrocks@gmail.com",
    to: options.user.email,
    subject: options.subject, // Subject line
    text,
    html,
  };
  if (options.cc) {
    mailOptions.cc = options.cc;
  }
  if (options.attachments) {
    mailOptions.attachments = options.attachments;
  }
  return transport.sendMail(mailOptions);
};
