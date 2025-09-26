import { toast } from 'react-toastify';
import axios from '../AxiosCustomize';
import Cookies from 'js-cookie';
export const finishBooking = async (bookingId) => {
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

export  const getMaterialsByBookingId = async (bookingId) => {
    try {
      const token = Cookies.get("accessToken");
  
      if (!token) {
        return { success: false, message: "Bạn chưa đăng nhập." };
      }
  
      const response = await axios.get(`/api/learner/materials/booking/${bookingId}`, {
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

export const getMyBookings = async () => {
    try {
      const token = Cookies.get("accessToken");
  
      if (!token) {
        console.warn("Không có token xác thực");
        return { success: false, message: "Chưa đăng nhập" };
      }
  
      const response = await axios.get('/api/learner/me/my-courses', {
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
  export const reportBooking = async (bookingId, reason) => {
    try {
      const token = Cookies.get("accessToken"); 
  
      const response = await axios.post(
        '/report', // URL
        { 
          targetType: 'booking',
          targetId: bookingId,
          reason: reason
        },
        { 
          headers: {
            Authorization: `Bearer ${token}` 
          }
        }
      );
      return response; 
    } catch (error) {
      console.error("Error reporting booking:", error);
      return { success: false, message: error.response?.data?.message || "Lỗi khi gửi báo cáo từ client." };
    }
  };
  export const fetchBookingDetailsApi = async (bookingId) => {
    try {
      const response = await axios.get(`/bookings/${bookingId}`);
      return response; 
    } catch (error) {
      console.error("Error fetching booking details:", error);
      return null;
    }
  };
  export  const getBookingsByTutorId = async (tutorId) => {
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