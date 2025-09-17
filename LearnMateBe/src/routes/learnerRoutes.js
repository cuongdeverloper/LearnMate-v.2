const express = require('express');
const routerApi = express.Router();
const { checkAccessToken, createRefreshToken, createJWT } = require('../middleware/JWTAction');

const tutorController = require('../controller/User/TutorController');
routerApi.get('/tutors', tutorController.getTutors);             // GET /api/tutors
routerApi.get('/tutors/:id', tutorController.getTutorById);       // GET /api/tutors/:id

// --- NEW ROUTES FOR SAVED TUTORS  ---
routerApi.get('/saved-tutors', checkAccessToken, tutorController.getSavedTutors);
routerApi.post('/saved-tutors/:tutorId', checkAccessToken, tutorController.addSavedTutor);
routerApi.delete('/saved-tutors/:tutorId', checkAccessToken, tutorController.removeSavedTutor);

module.exports = routerApi;