const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  learnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },

  scheduleIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Schedule' }],

  status: { 
    type: String, 
    enum: ['pending', 'active', 'completed', 'cancelled'], 
    default: 'pending' 
  },

  amount: { type: Number, required: true },           
  deposit: { type: Number, default: 0 },            
  sessionCost: { type: Number, default: 0 },         
  numberOfSessions: { type: Number, default: 0 },    
  paidSessions: { type: Number, default: 0 },         

  note: { type: String, default: '' },
  completed: { type: Boolean, default: false },       
  reported: { type: Boolean, default: false },
  reportedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
