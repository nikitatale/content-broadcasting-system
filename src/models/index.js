

const sequelize = require('../config/database');



const User = require('./User');


const Content = require('./Content');



User.hasMany(Content, { foreignKey: 'uploaded_by', as: 'uploadedContent' });


Content.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });



module.exports = { sequelize, User, Content };
