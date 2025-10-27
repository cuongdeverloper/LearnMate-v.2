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

const RouterAdmin = express.Router();

// Middleware: Kiểm tra access token và quyền admin
RouterAdmin.use(checkAccessToken);
RouterAdmin.use(checkAdminRole);

// Get all users for admin
RouterAdmin.get('/users', getAllUsers);

// Get specific user by ID
RouterAdmin.get('/users/:userId', getUserByUserId);

// Block user
RouterAdmin.patch('/users/:userId/block', blockUser);

// Unblock user  
RouterAdmin.patch('/users/:userId/unblock', unblockUser);

// Delete user
RouterAdmin.delete('/users/:userId', deleteUser);

// Tutor management routes
RouterAdmin.get('/tutor-applications', getAllTutorApplications);
RouterAdmin.patch('/tutor-applications/:applicationId/approve', approveTutorApplication);
RouterAdmin.patch('/tutor-applications/:applicationId/reject', rejectTutorApplication);

module.exports = RouterAdmin;