const express = require('express');
const routerApi = express.Router();
const { checkAccessToken, createRefreshToken, createJWT } = require('../middleware/JWTAction');

const tutorController = require('../controller/User/TutorController');
const bookingController = require('../controller/Booking/bookingController');
const profileController = require('../controller/User/ProfileController');
const paymentController = require('../controller/Payment/PaymentController');
const scheduleController = require('../controller/Schedule/ScheduleController');
const materialController = require('../controller/Booking/MaterialController');

routerApi.get('/tutors', tutorController.getTutors);             // GET /api/tutors
routerApi.get('/tutors/:tutorId', tutorController.getTutorById);       // GET /api/tutors/:id

// --- NEW ROUTES FOR SAVED TUTORS  ---
routerApi.get('/saved-tutors', checkAccessToken, tutorController.getSavedTutors);
routerApi.post('/saved-tutors/:tutorId', checkAccessToken, tutorController.addSavedTutor);
routerApi.delete('/saved-tutors/:tutorId', checkAccessToken, tutorController.removeSavedTutor);


routerApi.post('/bookings/:tutorId', checkAccessToken, bookingController.createBooking);

routerApi.get('/profile', checkAccessToken, profileController.getProfile);
routerApi.put('/update-profile', checkAccessToken, profileController.updateProfile);


routerApi.patch("/bookings/:bookingId/cancel", checkAccessToken, bookingController.cancelBooking);
routerApi.get('/bookings/:id', bookingController.getBookingById);


routerApi.get('/me/info', checkAccessToken,paymentController.getUserInfo); 

module.exports = routerApi;