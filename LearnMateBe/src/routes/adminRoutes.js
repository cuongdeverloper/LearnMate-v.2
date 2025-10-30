const express = require('express');
const { checkAccessToken } = require('../middleware/JWTAction');
const { checkAdminRole } = require('../middleware/adminMiddleware');
const { 
    getAllUsers, 
    blockUser, 
    unblockUser, 
    deleteUser,
    getUserByUserId,
    getAllTutorApplications,
    approveTutorApplication,
    rejectTutorApplication
} = require('../controller/User/UserController');

const {
    getAllReviews,
    toggleHideReview,
    deleteReview,
    markReview,
    getReviewStats
} = require('../controller/Admin/AdminReviewController');

const RouterAdmin = express.Router();

// Middleware: Kiểm tra access token và quyền admin
RouterAdmin.use(checkAccessToken);
RouterAdmin.use(checkAdminRole);

// User management routes
RouterAdmin.get('/users', getAllUsers);
RouterAdmin.get('/users/:userId', getUserByUserId);
RouterAdmin.patch('/users/:userId/block', blockUser);
RouterAdmin.patch('/users/:userId/unblock', unblockUser);
RouterAdmin.delete('/users/:userId', deleteUser);

// Tutor management routes
RouterAdmin.get('/tutor-applications', getAllTutorApplications);
RouterAdmin.patch('/tutor-applications/:applicationId/approve', approveTutorApplication);
RouterAdmin.patch('/tutor-applications/:applicationId/reject', rejectTutorApplication);

// Review management routes
RouterAdmin.get('/reviews', getAllReviews);
RouterAdmin.get('/reviews/stats', getReviewStats);
RouterAdmin.patch('/reviews/:reviewId/toggle-hide', toggleHideReview);
RouterAdmin.delete('/reviews/:reviewId', deleteReview);
RouterAdmin.patch('/reviews/:reviewId/mark', markReview);

module.exports = RouterAdmin;