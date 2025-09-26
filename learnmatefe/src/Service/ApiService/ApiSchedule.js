import { toast } from 'react-toastify';
import axios from '../AxiosCustomize';
import Cookies from 'js-cookie';
export const getMyWeeklySchedules = async (weekStartDate) => {
    try {
      const token = Cookies.get("accessToken");
  
      if (!token) {
        return { success: false, message: "Bạn chưa đăng nhập." };
      }
  
      const isoDate = new Date(weekStartDate).toISOString().split('T')[0];
  
      const response = await axios.get(`/api/learner/schedule/my-weekly-schedules?weekStart=${encodeURIComponent(isoDate)}`, {
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
  export const markScheduleAttendance = async (scheduleId, attended) => {
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
  export const fetchBusySlotsByBookingId = async (bookingId, weekStart) => {
    try {
      const response = await axios.get(`/schedule/booking/${bookingId}/busy-slots?weekStart=${weekStart}`);
      return response;
    } catch (error) {
      console.error("Error fetching busy slots:", error);
      return null;
    }
  };