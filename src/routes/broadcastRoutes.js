


const express = require('express');



const router = express.Router();



const { getLiveContent } = require('../controllers/broadcastController');


router.get('/live/:teacherId', getLiveContent);


module.exports = router;
