const express = require('express');
const RouteBooking = express.Router();
const bookingController = require('../controller/Booking/bookingController');
const scheduleController = require('../controller/Schedule/ScheduleController');
const { checkAccessToken } = require('../middleware/JWTAction');

RouteBooking.get("/user/:userId", bookingController.getUserBookingHistory);
RouteBooking.get("/bookings/my-courses",checkAccessToken, bookingController.getApprovedBookingsForLearner);
RouteBooking.patch("/bookings/:bookingId/cancel", checkAccessToken, bookingController.cancelBooking);
RouteBooking.get('/bookings/:id', bookingController.getBookingById);
RouteBooking.patch('/bookings/:bookingId/finish',checkAccessToken, bookingController.finishBooking);

RouteBooking.get('/schedule/booking/:bookingId/busy-slots', scheduleController.getBusySlotsForWeek);
RouteBooking.post('/schedule/booking/:bookingId/add-slots', scheduleController.addMultipleSlots);
RouteBooking.delete('/schedule/:scheduleId', scheduleController.deleteScheduleSlot);
RouteBooking.get('/schedule/my-weekly-schedules', checkAccessToken, scheduleController.getLearnerWeeklySchedules);
RouteBooking.patch('/schedule/:scheduleId/attendance', checkAccessToken, scheduleController.markAttendance); 

RouteBooking.post("/bookings/:bookingId/request-change", checkAccessToken, scheduleController.requestChangeSchedule);

module.exports = RouteBooking;