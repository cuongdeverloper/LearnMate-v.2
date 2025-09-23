const express = require('express');
const RouterTutor = express.Router();
const uploadCloud = require('../config/cloudinaryConfig');
const tutorCtrl = require('../controller/Tutor/TutorController');
const TutorApplication = require('../controller/Tutor/TutorApplicationController');
const BookingController = require('../controller/Booking/bookingController');
const { checkAccessToken } = require('../middleware/JWTAction');
const { getAllStudents } = require('../controller/User/UserController');
const uploadDocs = require('../config/cloudinaryDocxConfig');

RouterTutor.post('/bookings/respond', tutorCtrl.respondBooking);
RouterTutor.post('/bookings/cancel', tutorCtrl.cancelBooking);
RouterTutor.get('/bookings/pending/:tutorId', tutorCtrl.getPendingBookings);

RouterTutor.post('/schedule', tutorCtrl.createSchedule);
RouterTutor.get('/schedule/:tutorId', tutorCtrl.getSchedule);
RouterTutor.put('/schedule/:id', tutorCtrl.updateSchedule);
RouterTutor.delete('/schedule/:id', tutorCtrl.deleteSchedule);

RouterTutor.post('/progress', tutorCtrl.updateProgress);
RouterTutor.get('/progress/:studentId', tutorCtrl.getProgress);

// RouterTutor.post('/material/upload', tutorCtrl.uploadMaterial);
RouterTutor.post(
  '/material/upload',
  uploadDocs.single('file'),   
  tutorCtrl.uploadMaterial     
);
RouterTutor.get('/material/:bookingId', tutorCtrl.getMaterials);



RouterTutor.post(
  '/tutor/application',
  checkAccessToken,
  uploadCloud.single('cvFile'), 
  TutorApplication.submitApplication
);

RouterTutor.get('/tutor/applications', checkAccessToken, TutorApplication.getTutorApplications);
RouterTutor.get('/tutor/:tutorId/bookings', checkAccessToken,BookingController.getAllBookingsByTutorId);
RouterTutor.get('/materials/booking/:bookingId', checkAccessToken,tutorCtrl.getMaterials);
RouterTutor.get('/students', getAllStudents);  



module.exports = RouterTutor;