const multer = require("multer");

// multer setup
const uploader = multer({
  // dest: "avatars", // destination folder if not set then pass data to the next mw
  limits: {
    // number of bytes 1mb ~= 1000000 bytes
    // max size is 1mb
    fileSize: 1000000
  },
  // fileFilter(req, file, callback(err, boolean))
  fileFilter(req, file, cb) {
    // cb(err) - validation failed
    // cb(undefined, true) - file validation resolved
    // cb(undefined, false) - file validation rejected

    // looks for .pdf at the end of the file
    // if (!file.originalname.endsWith(".pdf")) {
    //   return cb(new Error("File is not a pdf document"));
    // }

    // checks if filename string contains the .doc or .docx
    // if(!file.originalname.match(/\.(doc|docx)$/)) {
    //     return cb(new Error("File is not a Word document"));
    // }

    // checks for .jpg, .jpeg, .png in filename string
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("File must be of image type(png, jpg, jpeg)"));
    }

    cb(undefined, true);
  }
});

// use upload as middleware for endpoint
// upload.single('<req.body => form-data => key to look for>') - for one file, put it in req.file
// upload.array('variable name', 12) - for multiple files, put them in req.files
// app.post('/upload', upload.single('picture'), (req, res ,next) => {
//   res.send()
// })

module.exports = uploader;
