const { Content, User } = require('../models');
const { Op } = require('sequelize');
const path = require('path');


const uploadContent = async (req, res) => {
  try {
    if (!req.file) {
      
      
      return res.status(400).json({ message: 'File is required' });
    }

    const { title, subject, description, start_time, end_time, rotation_duration } = req.body;




    if (!title || !subject) {


         return res.status(400).json({ message: 'Title and subject are required' });
    }

    const content = await Content.create({
      title,
      description: description || null,
      subject: subject.toLowerCase(),
      file_url: `/uploads/${req.file.filename}`,
      file_type: req.file.mimetype,
      file_size: req.file.size,
      uploaded_by: req.user.id,
      status: 'pending',
      start_time: start_time || null,
      end_time: end_time || null,
      rotation_duration: rotation_duration ? parseInt(rotation_duration) : 5,
    });

    return res.status(201).json({


      message: 'Content uploaded successfully',
      content,
    });


  } 
  catch (err) {
  
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};


const getMyContent = async (req, res) => {
  
  
  try {

    const contents = await Content.findAll({
      where: { uploaded_by: req.user.id },
      order: [['created_at', 'DESC']],
    });

    return res.json({ contents });

  }
   catch (err) {

    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};


const getAllContent = async (req, res) => {


  try {
    const { status } = req.query;

    const where = status ? { status } : {};

    const contents = await Content.findAll({
      where,
      include: [{ model: User, as: 'uploader', attributes: ['id', 'name', 'email'] }],
      order: [['created_at', 'DESC']],
    });



    return res.json({ contents });


  } catch (err) {

    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};






const approveContent = async (req, res) => {


  try {
    const { id } = req.params;


    const content = await Content.findByPk(id);

    if (!content) {

      return res.status(404).json({ message: 'Content not found' });
    }

    if (content.status !== 'pending') {

      return res.status(400).json({ message: 'Only pending content can be approved' });
    }

    await content.update({
      status: 'approved',
      approved_by: req.user.id,
      approved_at: new Date(),
      rejection_reason: null,
    });

    return res.json({ message: 'Content approved successfully', content });

  }
  
  catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};


const rejectContent = async (req, res) => {

  
  try {
    const { id } = req.params;

    const { rejection_reason } = req.body;

    if (!rejection_reason) {

      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const content = await Content.findByPk(id);


    if (!content) {


      return res.status(404).json({ message: 'Content not found' });
    }

    if (content.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending content can be rejected' });
    }

    await content.update({ status: 'rejected', rejection_reason });

    return res.json({ message: 'Content rejected', content });
  } 
  
  catch (err) {

    
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { uploadContent, getMyContent, getAllContent, approveContent, rejectContent };
