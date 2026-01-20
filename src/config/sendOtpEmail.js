const AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1",
});

const ses = new AWS.SES();

module.exports = async (email, otp) => {
  await ses.sendEmail({
    Source: "Trubute <info@whaleconsultancy.in>", // verified
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: "Your Trubute Verification Code" },
      Body: {
        Text: {
          Data: `Your OTP is ${otp}. It expires in 5 minutes.`,
        },
      },
    },
  }).promise();
};
