


const { DataTypes } = require('sequelize');


const sequelize = require('../config/database');

const Content = sequelize.define('Content', {

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },


  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },


  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },



  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },



  file_url: {
    type: DataTypes.STRING,
    allowNull: false,
  },


  file_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },



  file_size: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },



  uploaded_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },



  status: {
    type: DataTypes.ENUM('uploaded', 'pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },


  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },


  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'users', key: 'id' },
  },


  approved_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },



  start_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },


  end_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },




  rotation_duration: {
    type: DataTypes.INTEGER,   
    defaultValue: 5,
  },
}, 


{
  tableName: 'content',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Content;
