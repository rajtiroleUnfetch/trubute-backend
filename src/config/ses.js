const AWS = require("aws-sdk");
if (process.env.NODE_ENV !== "production") {
  console.log("prod env")
  require("dotenv").config();
}
AWS.config.update({
  region: process.env.AWS_REGION||"us-east-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID_SES,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_SES,
});

const ses = new AWS.SES();

module.exports = ses;
