

const express = require('express');




const path = require('path');


require('dotenv').config();

const { sequelize } = require('./models');

const authRoutes = require('./routes/authRoutes');



const contentRoutes = require('./routes/contentRoutes');


const broadcastRoutes = require('./routes/broadcastRoutes');

const app = express();




app.use(express.json());



app.use(express.urlencoded({ extended: true }));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/auth', authRoutes);


app.use('/content', contentRoutes);


app.use('/content', broadcastRoutes);


app.get('/', (req, res) => {

      res.json({ message: 'Content Broadcasting System API is running' });


});


app.use((req, res) => {
  
      res.status(404).json({ message: 'Route not found' });
});


app.use((err, req, res, next) => {
 
 
  if (err.code === 'LIMIT_FILE_SIZE') {
                   return res.status(400).json({ message: 'File too large. Max size is 10MB' });
  }
  
  
  if (err.message && err.message.includes('Only JPG')) {
                  return res.status(400).json({ message: err.message });
  }
  
  
  
  return res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true })
  .then(() => {
    console.log('DB connected....');
    
    
    app.listen(PORT, () => {
                    console.log(`Server running on ${PORT}`);
    });
  })
  .catch((err) => {
        console.error('Database connection failed:', err.message);
  });





module.exports = app;
