


const express = require('express');



const router = express.Router();


const { authenticate, authorize } = require('../middlewares/auth');


const upload = require('../middlewares/upload');



const {
  uploadContent,
  getMyContent,
  getAllContent,
  approveContent,
  rejectContent,
} = require('../controllers/contentController');



router.post('/upload', authenticate, authorize('teacher'), upload.single('file'), uploadContent);



router.get('/my', authenticate, authorize('teacher'), getMyContent);


router.get('/all', authenticate, authorize('principal'), getAllContent);


router.patch('/:id/approve', authenticate, authorize('principal'), approveContent);


router.patch('/:id/reject', authenticate, authorize('principal'), rejectContent);

module.exports = router;
