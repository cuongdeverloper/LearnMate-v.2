import axios from '../AxiosCustomize';
import Cookies from 'js-cookie';

class AdminService {
    // Get all users
    static async getAllUsers() {
        try {
            const token = Cookies.get("accessToken");

            if (!token) {
                console.error('No access token found');
                window.open("/signin", "_blank");
                return null;
            }

            console.log('Making API call to /api/admin/users with token:', token.substring(0, 20) + '...');

            const response = await axios.get('/api/admin/users', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log('Full API response:', response);
            console.log('Response type:', typeof response);
            console.log('Is response array?', Array.isArray(response));
            
            // Axios interceptor đã extract response.data, nên response đã là data trực tiếp
            return response;
        } catch (error) {
            console.error('Error fetching users - Full error:', error);
            console.error('Error response:', error.response);
            console.error('Error status:', error.response?.status);
            console.error('Error data:', error.response?.data);
            return null;
        }
    }

    // Get user by ID
    static async getUserById(userId) {
        try {
            const token = Cookies.get("accessToken");

            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.get(`/api/admin/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching user:', error);
            return null;
        }
    }

    // Block user
    static async blockUser(userId, reason) {
        try {
            const token = Cookies.get("accessToken");

            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.patch(
                `/api/admin/users/${userId}/block`,
                { reason },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error blocking user:', error);
            return null;
        }
    }

    // Unblock user
    static async unblockUser(userId) {
        try {
            const token = Cookies.get("accessToken");

            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.patch(
                `/api/admin/users/${userId}/unblock`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error unblocking user:', error);
            return null;
        }
    }

    // Delete user
    static async deleteUser(userId, reason) {
        try {
            const token = Cookies.get("accessToken");

            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.delete(
                `/api/admin/users/${userId}`,
                { 
                    data: { reason },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error deleting user:', error);
            return null;
        }
    }

    // ========== TUTOR MANAGEMENT FUNCTIONS ==========
    
    // Get all tutor applications
    static async getAllTutorApplications() {
        try {
            const token = Cookies.get("accessToken");

            if (!token) {
                console.error('No access token found');
                window.open("/signin", "_blank");
                return null;
            }

            console.log('Making API call to /api/admin/tutor-applications');

            const response = await axios.get('/api/admin/tutor-applications', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log('Tutor applications response:', response);
            // Axios interceptor đã extract response.data, nên response đã là data trực tiếp
            return response;
        } catch (error) {
            console.error('Error fetching tutor applications - Full error:', error);
            console.error('Error response:', error.response);
            console.error('Error status:', error.response?.status);
            console.error('Error data:', error.response?.data);
            return null;
        }
    }

    // Approve tutor application
    static async approveTutorApplication(applicationId) {
        try {
            const token = Cookies.get("accessToken");

            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.patch(
                `/api/admin/tutor-applications/${applicationId}/approve`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            // Return response data để component có thể kiểm tra success
            return response;
        } catch (error) {
            console.error('Error approving tutor application:', error);
            throw error; // Let component handle the error
        }
    }

    // Reject tutor application
    static async rejectTutorApplication(applicationId, reason) {
        try {
            const token = Cookies.get("accessToken");

            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            console.log('Rejecting application:', applicationId, 'with reason:', reason);
            
            const response = await axios.patch(
                `/api/admin/tutor-applications/${applicationId}/reject`,
                { reason },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            // Return response data để component có thể kiểm tra success
            return response;
        } catch (error) {
            throw error;
        }
    }
}

export default AdminService;