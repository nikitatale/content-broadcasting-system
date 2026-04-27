

const multer = require('multer');




const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../src/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },


});

const fileFilter = (req, file, cb) => {


  const allowed = ['image/jpeg', 'image/png', 'image/gif'];


  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } 
  else {
    cb(new Error('Only JPG, PNG, GIF files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
});

module.exports = upload;
