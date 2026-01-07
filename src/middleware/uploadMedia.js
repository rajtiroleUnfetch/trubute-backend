const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("../config/s3");
if (process.env.NODE_ENV !== "production") {  
  console.log("prod env")
  require("dotenv").config();
}
const upload = multer({
  storage: multerS3({
    s3,
    bucket: 'trubute-data',   // <-- FIXED (must exist)
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const ext = file.originalname.split(".").pop();
      const filename = `memorial-media/${Date.now()}.${ext}`;
      cb(null, filename);
    },
  }),
});

module.exports = upload;
