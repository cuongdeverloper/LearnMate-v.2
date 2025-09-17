import { toast } from 'react-toastify';
import axios from '../AxiosCustomize';
import Cookies from 'js-cookie';
const ApiLogin = (userEmail, userPassword) => {
  return axios.post('/login', { email: userEmail, password: userPassword });
}

const sendOTPApi = async (userId, otp) => {
  try {
    const response = await axios.post('/verify-otp', { userId, OTP: otp });
    return response
  } catch (error) {
    console.error("Error verifying OTP:", error.response ? error.response.data : error.message);
    return { errorCode: 1, message: 'Failed to verify OTP' };
  }
};

const ApiRegister = async (username, email, password, phoneNumber, gender, role, image) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('email', email);
  formData.append('password', password);
  formData.append('phoneNumber', phoneNumber);
  formData.append('gender', gender);
  formData.append('role', role);
  if (image) {
    formData.append('image', image);
  }

  try {
    const response = await axios.post('/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response
  } catch (error) {
    console.error('Error during registration:', error);
    throw error;
  }
};
const loginWGoogle = () => {
  return axios.get(`/auth/google/callback`)
}

const requestPasswordResetApi = async (email) => {
  try {
    const response = await axios.post('/rqreset-password', { email });
    return response;
  } catch (error) {
    console.log(error)
  }
};

const resetPasswordApi = async (token, newPassword) => {
  try {
    const response = await axios.post('/reset-password', { token, newPassword });
    return response;
  } catch (error) {
    console.log(error)
  }
};
const ApiGetUserByUserId = async (userId) => {
  try {
    const token = Cookies.get("accessToken");

    if (!token) {
      window.open("/signin", "_blank");
      return;
    }

    const response = await axios.get(`/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  } catch (error) {
    console.error("Error get user:", error);
    return null;
  }
};
const ApiMarkMessagesAsSeen = async (conversationId) => {
  try {
    const token = Cookies.get("accessToken");

    if (!token) {
      window.open("/signin", "_blank");
      return;
    }

    const response = await axios.put(`/seenmessage/${conversationId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  } catch (error) {
    console.error("Error message seen :", error);
    return null;
  }
};
const ApiSendMessage = async (receiverId, text) => {
  try {
    const token = Cookies.get("accessToken");

    if (!token) {
      window.open("/signin", "_blank");
      return;
    }

    const response = await axios.post(
      "/message",
      { receiverId, text },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response;
  } catch (error) {
    console.error("Error sending message:", error);
    return null;
  }
};

const getConversationApi = async () => {
  try {
    const token = Cookies.get("accessToken");

    if (!token) {
      window.open("/signin", "_blank");
      return null;
    }

    const response = await axios.get(`/conversation`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  } catch (error) {
    console.error("Error getting conversations:", error);
    return null;
  }
};
const ApiGetMessageByConversationId = async (conversationId) => {
  try {
    const token = Cookies.get("accessToken");

    if (!token) {
      window.open("/signin", "_blank");
      return;
    }

    const response = await axios.get(`/messages/${conversationId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  } catch (error) {
    console.error("Error get chat:", error);
    return null;
  }
};



const fetchTutorsBySubjects = async (subjectsArray) => {
  try {
    const subjectsQuery = encodeURIComponent(subjectsArray.join(','));
    const response = await axios.get(`/tutors?subjects=${subjectsQuery}`);
    return response;
  } catch (error) {
    console.error("Error fetching tutors by subjects:", error);
    return { success: false, message: 'Lỗi khi gọi API tìm gia sư theo môn học' };
  }
};



const fetchPendingBookings = (tutorId) => {
  return axios.get(`/api/tutor/bookings/pending/${tutorId}`);
};
const respondBooking = (bookingId, action, learnerId) => {
  return axios.post(`/api/tutor/bookings/respond`, { bookingId, action, learnerId });
};

const cancelBooking = (bookingId, reason) => {
  return axios.post(`/api/tutor/bookings/cancel`, { bookingId, reason });
};

const getTutorSchedule = (tutorId) => {
  return axios.get(`/api/tutor/schedule/${tutorId}`);
};

const createSchedule = (tutorId, scheduleData) => {
  return axios.post(`/api/tutor/schedule`, { tutorId, ...scheduleData });
};

const updateSchedule = (scheduleId, updatedData) => {
  return axios.put(`/api/tutor/schedule/${scheduleId}`, updatedData);
};

const deleteSchedule = (scheduleId) => {
  return axios.delete(`/api/tutor/schedule/${scheduleId}`);
};

const getTeachingProgress = (studentId) => {
  return axios.get(`/api/tutor/progress/${studentId}`);
};

const updateTeachingProgress = (studentId, progressData) => {
  return axios.post(`/api/tutor/progress`, { studentId, ...progressData });
};
const fetchStudentsApi = async () => {
  try {
    const response = await axios.get('/students');
    return response;
  } catch (error) {
    console.error("Failed to fetch students:", error);
    return [];
  }
};



const getBookingDetailsById = async (bookingId) => {
  try {
    const response = await axios.get(`/bookings/${bookingId}`);
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin khóa học:", error);
    return null;
  }
};
const getBusySlotsByBookingId = async (bookingId, weekStart) => {
  try {
    const response = await axios.get(
      `/schedule/booking/${bookingId}/busy-slots?weekStart=${encodeURIComponent(weekStart)}`
    );
    return response;
  } catch (error) {
    console.error("Lỗi khi tải lịch bận:", error);
    return null;
  }
};

const addBookingSlots = async (bookingId, slots) => {
  try {
    const response = await axios.post(
      `/schedule/booking/${bookingId}/add-slots`,
      { slots }
    );
    return { success: true, data: response };
  } catch (error) {
    console.error("Lỗi khi thêm lịch:", error);
    const message = error.response?.data?.message || error.message || "Thêm lịch thất bại";
    return { success: false, message };
  }
};

const getMyBookings = async () => {
  try {
    const token = Cookies.get("accessToken");

    if (!token) {
      console.warn("Không có token xác thực");
      return { success: false, message: "Chưa đăng nhập" };
    }

    const response = await axios.get('/bookings/my-courses', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return { success: true, data: response };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách khóa học:", error);
    const message = error.response?.message || "Không thể tải danh sách khóa học";
    return { success: false, message };
  }
};

const finishBooking = async (bookingId) => {
  try {
    const token = Cookies.get("accessToken");

    if (!token) {
      return { success: false, message: "Bạn chưa đăng nhập." };
    }

    const response = await axios.patch(`/bookings/${bookingId}/finish`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return { success: true, data: response };
  } catch (error) {
    console.error("Lỗi hoàn tất khóa học:", error);
    const message = error.response?.data?.message || "Lỗi hoàn tất khóa học.";
    return { success: false, message };
  }
};

const getMyWeeklySchedules = async (weekStartDate) => {
  try {
    const token = Cookies.get("accessToken");

    if (!token) {
      return { success: false, message: "Bạn chưa đăng nhập." };
    }

    const isoDate = new Date(weekStartDate).toISOString().split('T')[0];

    const response = await axios.get(`/schedule/my-weekly-schedules?weekStart=${encodeURIComponent(isoDate)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return { success: true, data: response };
  } catch (error) {
    console.error("Lỗi khi tải lịch học:", error);
    const message = error.response?.message || "Không thể tải lịch học";
    return { success: false, message };
  }
};

const markScheduleAttendance = async (scheduleId, attended) => {
  try {
    const token = Cookies.get("accessToken");

    if (!token) {
      return { success: false, message: "Bạn chưa đăng nhập." };
    }

    const response = await axios.patch(
      `/schedule/${scheduleId}/attendance`,
      { attended: Boolean(attended) },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Lỗi khi điểm danh:", error);
    const message = error.response?.data?.message || "Lỗi không xác định khi điểm danh.";
    return { success: false, message };
  }
};

const getMaterialsByBookingId = async (bookingId) => {
  try {
    const token = Cookies.get("accessToken");

    if (!token) {
      return { success: false, message: "Bạn chưa đăng nhập." };
    }

    const response = await axios.get(`/materials/booking/${bookingId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return { success: true, data: response };
  } catch (error) {
    console.error("Lỗi khi tải tài liệu học tập:", error);
    const message = error.response?.message || "Không thể tải tài liệu học tập.";
    return { success: false, message };
  }
};

const fetchNotificationsApi = async (limit = 10) => {
  try {
    const accessToken = Cookies.get('accessToken');

    if (!accessToken) {
      window.open("/signin", "_blank");
      return;
    }

    const response = await axios.get(`/notifications?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data.notifications;
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }
};

const fetchUnreadCountApi = async () => {
  try {
    const accessToken = Cookies.get('accessToken');

    if (!accessToken) {
      window.open("/signin", "_blank");
      return 0;
    }

    const response = await axios.get('/notifications/unread-count', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data.count;
  } catch (error) {
    console.error('Failed to fetch unread count:', error);
    return 0;
  }
};

const markNotificationAsReadApi = async (notificationId) => {
  try {
    const accessToken = Cookies.get('accessToken');

    if (!accessToken) {
      window.open("/signin", "_blank");
      return;
    }

    await axios.put(`/notifications/${notificationId}/read`, {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return true;
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return false;
  }
};

const markAllNotificationsAsReadApi = async () => {
  try {
    const accessToken = Cookies.get('accessToken');

    if (!accessToken) {
      window.open("/signin", "_blank");
      return;
    }

    await axios.put('/notifications/read-all', {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return true;
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    return false;
  }
};

const deleteNotificationApi = async (notificationId) => {
  try {
    const accessToken = Cookies.get('accessToken');

    if (!accessToken) {
      window.open("/signin", "_blank");
      return;
    }

    await axios.delete(`/notifications/${notificationId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return true;
  } catch (error) {
    console.error("Failed to delete notification:", error);
    return false;
  }
};
const fetchUsersApi = async () => {
  try {
    const accessToken = Cookies.get("accessToken");

    if (!accessToken) {
      console.error("No access token found.");
      return { error: true, message: "No access token" };
    }

    const response = await axios.get('/admin/users', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (response && Array.isArray(response)) {
      return { error: false, data: response };
    } else {
      return { error: true, message: "Invalid response format" };
    }
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return { error: true, message: "Failed to fetch users" };
  }
};

const blockUserApi = async (userId, reason) => {
  try {
    const accessToken = Cookies.get("accessToken");

    if (!accessToken) {
      console.error("No access token found.");
      return { success: false, message: "No access token" };
    }

    await axios.put(`/admin/users/${userId}/block`, { reason }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to block user:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to block user",
    };
  }
};


const unblockUserApi = async (userId) => {
  try {
    const accessToken = Cookies.get("accessToken");

    if (!accessToken) {
      console.error("No access token found.");
      return { success: false, message: "No access token" };
    }

    await axios.put(`/admin/users/${userId}/unblock`, {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to unblock user:", error);
    return { success: false, message: "Failed to unblock user" };
  }
};

const deleteUserApi = async (userId, reason) => {
  try {
    const accessToken = Cookies.get("accessToken");

    if (!accessToken) {
      console.error("No access token found.");
      return { success: false, message: "No access token" };
    }

    await axios.delete(`/admin/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      data: { reason },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete user:", error);
    return { success: false, message: "Failed to delete user" };
  }
};

const fetchApplicationsApi = async () => {
  try {
    const accessToken = Cookies.get("accessToken");

    if (!accessToken) {
      console.error("No access token found.");
      return { error: true, message: "No access token" };
    }

    const response = await axios.get('/admin/applications', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (response.errorCode === 0) {
      return { error: false, data: response.data };
    } else {
      return { error: true, message: "Failed to fetch applications" };
    }
  } catch (error) {
    console.error("Error fetching applications:", error);
    return { error: true, message: "Failed to fetch applications" };
  }
};

const approveApplicationApi = async (applicationId) => {
  try {
    const accessToken = Cookies.get("accessToken");

    if (!accessToken) {
      console.error("No access token found.");
      return { success: false, message: "No access token" };
    }

    const response = await axios.put(`/admin/applications/${applicationId}/approve`, {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.data.errorCode === 0) {
      return { success: true };
    } else {
      return { success: false, message: "Approval failed" };
    }
  } catch (error) {
    console.error("Error approving application:", error);
    return { success: false, message: "Failed to approve application" };
  }
};

const rejectApplicationApi = async (applicationId, rejectionReason) => {
  try {
    const accessToken = Cookies.get("accessToken");

    if (!accessToken) {
      console.error("No access token found.");
      return { success: false, message: "No access token" };
    }

    const response = await axios.put(
      `/admin/applications/${applicationId}/reject`,
      { rejectionReason },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.data.errorCode === 0) {
      return { success: true };
    } else {
      return { success: false, message: "Rejection failed" };
    }
  } catch (error) {
    console.error("Error rejecting application:", error);
    return { success: false, message: "Failed to reject application" };
  }
};

const verifyTutorApi = async (tutorId, token) => {
  try {
    const response = await axios.put(`/admin/tutors/${tutorId}/verify`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    console.error('Error verifying tutor:', error);
    return { errorCode: 1, message: 'Failed to verify tutor' };
  }
};

const unverifyTutorApi = async (tutorId, token) => {
  try {
    const response = await axios.put(`/admin/tutors/${tutorId}/unverify`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    console.error('Error unverifying tutor:', error);
    return { errorCode: 1, message: 'Failed to unverify tutor' };
  }
};


const deleteTutorApi = async (tutorId, token) => {
  try {
    const response = await axios.delete(`/admin/tutors/${tutorId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response;
  } catch (error) {
    console.error('Error deleting tutor:', error);
    return { errorCode: 1, message: 'Failed to delete tutor' };
  }
};
const fetchTutorsApi = async (token) => {
  try {
    const response = await axios.get('/admin/tutors', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (response.errorCode === 0) {
      return {
        errorCode: 0,
        data: response.data
      };
    } else {
      return {
        errorCode: response.errorCode,
        message: response.message
      };
    }
  } catch (error) {
    console.error('Error fetching tutors:', error);
    return {
      errorCode: 1,
      message: 'Failed to fetch tutors'
    };
  }
};

const verifyAccountApi = async (token) => {
  try {
    const response = await axios.get(`/verify-account?token=${token}`);
    return response;
  } catch (error) {
    console.error("Error verifying account:", error);
    throw error;
  }
};

const ApiGetProfile = async () => {
  const token = Cookies.get("accessToken");

  if (!token) {
    throw new Error("No access token found");
  }

  try {
    const response = await axios.get('/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

const ApiUpdateProfile = async (form) => {
  const formData = new FormData();
  Object.entries(form).forEach(([key, value]) => {
    if (value !== null) {
      formData.append(key, value);
    }
  });

  const access_token = Cookies.get('accessToken'); 

  if (!access_token) {
    throw new Error('Access token not found');
  }

  try {
    const response = await axios.put('/update-profile', formData, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error("Update profile failed:", error);
    throw error;
  }
};

const ApiChangePassword = async (oldPassword, newPassword, confirmPassword) => {
  const token = Cookies.get("accessToken");

  if (!token) {
    throw new Error("Access token not found");
  }

  try {
    const response = await axios.post('/change-password',
      { oldPassword, newPassword, confirmPassword },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Change password failed:", error);
    throw error;
  }
};
export const createReview = async (data) => {
  try {
    const response = await axios.post('/review', data);
    return response;
  } catch (error) {
    console.error("Error creating review:", error);
    throw error;
  }
};


export const getReviewsByCourse = async (courseId) => {
  try {
    const response = await axios.get(`/review/course/${courseId}`);
    return response;
  } catch (error) {
    console.error("Error fetching reviews by course:", error);
    throw error;
  }
};

 const getBookingsByTutorId = async (tutorId) => {
  try {
    const token = Cookies.get("accessToken");

    if (!token) {
      window.open("/signin", "_blank");
      return;
    }

    const response = await axios.get(`/tutor/${tutorId}/bookings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  } catch (error) {
    console.error("Error fetching bookings by tutorId:", error);
    return null;
  }
};
 const fetchScheduleDataApi = async (bookingId) => {
  if (!bookingId) return { errorCode: 1, data: [], message: 'Invalid booking ID' };

  try {
    const token = Cookies.get('accessToken');
    const { data } = await axios.get(`/admin/bookings/${bookingId}/schedules`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (err) {
    console.error('Error fetching schedule:', err);
    return { errorCode: 1, message: 'Failed to fetch schedule data' };
  }
};

// Fetch bookings with filters, pagination, etc.
 const fetchBookingsApi = async (params = {}) => {
  try {
    const token = Cookies.get('accessToken');
    const { data } = await axios.get(`/admin/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return data;
  } catch (err) {
    console.error('Error fetching bookings:', err);
    return { errorCode: 1, message: 'Failed to fetch bookings' };
  }
};

const fetchBookingDetailsApi = async (bookingId) => {
  try {
    const response = await axios.get(`/bookings/${bookingId}`);
    return response; 
  } catch (error) {
    console.error("Error fetching booking details:", error);
    return null;
  }
};
const fetchBusySlotsByBookingId = async (bookingId, weekStart) => {
  try {
    const response = await axios.get(`/schedule/booking/${bookingId}/busy-slots?weekStart=${weekStart}`);
    return response;
  } catch (error) {
    console.error("Error fetching busy slots:", error);
    return null;
  }
};
const uploadMaterial = async ({ bookingId, title, description, fileUrl }) => {
  try {
    const token = Cookies.get("accessToken");
    if (!token) {
      window.open("/signin", "_blank");
      return { errorCode: 1, message: 'Unauthorized' };
    }

    const payload = { bookingId, title, description, fileUrl };

    const response = await axios.post('/tutor/material/upload', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    console.log(response)
    // Trả lại response dạng { errorCode: 0, data }
    if (response) {
      return { errorCode: 0, data: response.data };
    } else {
      return { errorCode: 1, message: response.message || 'Upload failed' };
    }
  } catch (error) {
    console.error("Error uploading material:", error);
    return { errorCode: 1, message: error?.response?.message || 'Failed to upload material' };
  }
};

const getMaterialsForBooking = async (bookingId) => {
  const token = Cookies.get("accessToken");

  if (!token) {
    return { errorCode: 1, message: "Unauthorized" };
  }

  try {
    const response = await axios.get(`/materials/booking/${bookingId}`, {
      headers: {
        Authorization: `Bearer ${token}`, 
      },
    });

    return response;
  } catch (error) {
    console.error("Error fetching materials:", error);
    return { errorCode: 1, message: 'Failed to fetch materials' };
  }
};

export const submitTutorApplication = async (formData) => {
  try {
    const data = new FormData();

    // Append all form data fields
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'availableTimes') {
        data.append(key, JSON.stringify(value));
      } else if (Array.isArray(value)) {
        value.forEach(v => data.append(key, v));
      } else {
        data.append(key, value);
      }
    });

    const token = Cookies.get('accessToken');

    if (!token) {
      throw new Error('Unauthorized: No access token');
    }

    // Debug: In nội dung FormData
    for (let pair of data.entries()) {
      console.log(`FormData Entry: ${pair[0]}, Value: ${pair[1]}`);
    }

    // ✅ GỠ BỎ Content-Type - axios sẽ tự thêm boundary đúng
    const response = await axios.post('/tutor/application', data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return {
      success: true,
      message: 'Nộp đơn thành công!',
      data: response.data
    };

  } catch (error) {
    console.error('Error submitting tutor application:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Đã xảy ra lỗi khi nộp đơn.',
      error: error.response?.data || error
    };
  }
};
export const getTutorActiveStatus = async () => {
  const token = Cookies.get("accessToken");

  if (!token) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const res = await axios.get('/tutor/active-status', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res;
  } catch (error) {
    console.error("Lỗi lấy trạng thái tutor:", error);
    return { success: false, message: error?.response?.message || "Lỗi server" };
  }
};

export const updateTutorActiveStatus = async (active) => {
  const token = Cookies.get("accessToken");

  if (!token) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const res = await axios.put('/tutor/active-status', { active }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res;
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái tutor:", error);
    return { success: false, message: error?.response?.message || "Lỗi cập nhật" };
  }
};
 const reportBooking = async (bookingId, reason) => {
  try {
    const token = Cookies.get("accessToken"); // Correctly retrieves token from cookies

    const response = await axios.post(
      '/report', // URL
      { // Data payload (body of the request)
        targetType: 'booking',
        targetId: bookingId,
        reason: reason
      },
      { // Configuration object (this is where headers, params, etc., go)
        headers: {
          Authorization: `Bearer ${token}` // Correct placement of Authorization header
        }
      }
    );
    return response; // Assumes your backend returns { success: true, message: ... }
  } catch (error) {
    console.error("Error reporting booking:", error);
    return { success: false, message: error.response?.data?.message || "Lỗi khi gửi báo cáo từ client." };
  }
};

export {
  ApiLogin, sendOTPApi, ApiRegister, loginWGoogle, requestPasswordResetApi, resetPasswordApi,
  ApiGetUserByUserId, ApiMarkMessagesAsSeen, ApiSendMessage, getConversationApi, ApiGetMessageByConversationId, fetchTutorsBySubjects
  , uploadMaterial, fetchPendingBookings, getMaterialsForBooking, respondBooking,
  cancelBooking,
  getTutorSchedule,fetchScheduleDataApi,fetchBookingsApi,
  createSchedule,fetchBookingDetailsApi,
  updateSchedule,
  deleteSchedule,
  getTeachingProgress,
  updateTeachingProgress,fetchBusySlotsByBookingId,
  fetchStudentsApi, getBookingDetailsById, getBusySlotsByBookingId,
  addBookingSlots,
  getMyBookings, finishBooking, getMyWeeklySchedules, markScheduleAttendance,
  getMaterialsByBookingId, fetchNotificationsApi, fetchUnreadCountApi,
  markNotificationAsReadApi, markAllNotificationsAsReadApi, deleteNotificationApi, fetchUsersApi, blockUserApi,
  unblockUserApi, deleteUserApi, fetchApplicationsApi, approveApplicationApi,
  rejectApplicationApi,verifyTutorApi,unverifyTutorApi,deleteTutorApi,fetchTutorsApi,
  verifyAccountApi,ApiGetProfile,ApiUpdateProfile,ApiChangePassword,getBookingsByTutorId,reportBooking
}