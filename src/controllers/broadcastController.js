


const { Content, User } = require('../models');



const { Op } = require('sequelize');



const getActiveLiveContent = (approvedContents) => {
 


  const bySubject = {};


  for (const c of approvedContents) {


    if (!bySubject[c.subject]) bySubject[c.subject] = [];


    bySubject[c.subject].push(c);
  }

      const result = {};


  const now = new Date();

  for (const [subject, items] of Object.entries(bySubject)) {
   


    const sorted = items.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    if (sorted.length === 0) continue;

 


    const totalCycleMs = sorted.reduce((sum, c) => sum + (c.rotation_duration * 60 * 1000), 0);

    if (totalCycleMs === 0) continue;


    const startOfDay = new Date(now);
       
    
   
       startOfDay.setHours(0, 0, 0, 0);
    
    
       const elapsed = now - startOfDay;

    
    const positionInCycle = elapsed % totalCycleMs;


    let accumulatedMs = 0;


      let activeItem = null;

    for (const item of sorted) {



      accumulatedMs += item.rotation_duration * 60 * 1000;


      if (positionInCycle < accumulatedMs) {


        activeItem = item;
        break;


      }
    }

    if (activeItem) {
      result[subject] = activeItem;


    }
  }

  return result;
};


const getLiveContent = async (req, res) => {
  try {


    const { teacherId } = req.params;


    const { subject } = req.query;


    const teacher = await User.findOne({ where: { id: teacherId, role: 'teacher' } });
    
    
    if (!teacher) {



      return res.json({ message: 'No content available', data: null });
    }



    const now = new Date();

  
    const where = {
      uploaded_by: teacherId,
      status: 'approved',
      start_time: { [Op.lte]: now },
      end_time: { [Op.gte]: now },
    };

    if (subject) {
     
     
        where.subject = subject.toLowerCase();
    }

    const approvedContents = await Content.findAll({ where });

   
    if (!approvedContents.length) {
      
      
      
      return res.json({ message: 'No content available', data: null });
    }

    
    const activeBySubject = getActiveLiveContent(approvedContents);

    if (Object.keys(activeBySubject).length === 0) {
      
return res.json({ message: 'No content available', data: null });
    }

    return res.json({
      message: 'Live content fetched successfully',
      teacher: { id: teacher.id, name: teacher.name },
      data: activeBySubject,
    });
  } 
  
  
  catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};




module.exports = { getLiveContent };
