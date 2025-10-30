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

            const response = await axios.get('/api/admin/users', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            // Axios interceptor đã extract response.data, nên response đã là data trực tiếp
            return response;
        } catch (error) {
            console.error('Error fetching users:', error.response?.data?.message || error.message);
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

    // ========== REVIEW MANAGEMENT FUNCTIONS ==========
    
    // Get all reviews
    static async getAllReviews(page = 1, limit = 10, status = '', search = '') {
        try {
            const token = Cookies.get("accessToken");

            if (!token) {
                console.error('No access token found');
                window.open("/signin", "_blank");
                return null;
            }

            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(status && { status }),
                ...(search && { search })
            });

            const response = await axios.get(`/api/admin/reviews?${params}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching reviews - Full error:', error);
            console.error('Error response:', error.response);
            console.error('Error status:', error.response?.status);
            console.error('Error data:', error.response?.data);
            throw error;
        }
    }

    // Get review stats
    static async getReviewStats() {
        try {
            const token = Cookies.get("accessToken");

            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.get('/api/admin/reviews/stats', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching review stats:', error);
            throw error;
        }
    }

    // Toggle hide review
    static async toggleHideReview(reviewId) {
        try {
            const token = Cookies.get("accessToken");

            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.patch(
                `/api/admin/reviews/${reviewId}/toggle-hide`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Delete review
    static async deleteReview(reviewId, reason) {
        try {
            const token = Cookies.get("accessToken");

            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.delete(
                `/api/admin/reviews/${reviewId}`,
                {
                    data: { reason },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Mark review as spam/offensive
    static async markReview(reviewId, type) {
        try {
            const token = Cookies.get("accessToken");

            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.patch(
                `/api/admin/reviews/${reviewId}/mark`,
                { type },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Review Management APIs
    static async getAllReviews(page = 1, pageSize = 10, status = '', search = '') {
        try {
            const token = Cookies.get("accessToken");
            
            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString(),
            });

            if (status) params.append('status', status);
            if (search) params.append('search', search);

            const response = await axios.get(`/api/admin/reviews?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response;
        } catch (error) {
            console.error('Error fetching reviews:', error);
            throw error;
        }
    }

    static async getReviewStats() {
        try {
            const token = Cookies.get("accessToken");
            
            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.get('/api/admin/reviews/stats', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response;
        } catch (error) {
            console.error('Error fetching review stats:', error);
            throw error;
        }
    }

    static async toggleHideReview(reviewId) {
        try {
            const token = Cookies.get("accessToken");
            
            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.patch(`/api/admin/reviews/${reviewId}/toggle-hide`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response;
        } catch (error) {
            console.error('Error toggling review visibility:', error);
            throw error;
        }
    }

    static async deleteReview(reviewId, reason) {
        try {
            const token = Cookies.get("accessToken");
            
            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.delete(`/api/admin/reviews/${reviewId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                data: {
                    deleteReason: reason
                }
            });

            return response;
        } catch (error) {
            console.error('Error deleting review:', error);
            throw error;
        }
    }

    static async markReview(reviewId, markType) {
        try {
            const token = Cookies.get("accessToken");
            
            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.patch(`/api/admin/reviews/${reviewId}/mark`, {
                markType: markType
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response;
        } catch (error) {
            console.error('Error marking review:', error);
            throw error;
        }
    }
}

export default AdminService;