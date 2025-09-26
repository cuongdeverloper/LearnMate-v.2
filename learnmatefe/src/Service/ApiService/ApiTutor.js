import { toast } from 'react-toastify';
import axios from '../AxiosCustomize';
import Cookies from 'js-cookie';

const getTutorById = async (tutorId) => {
    try {
      const response = await axios.get(`/api/learner/tutors/${tutorId}`);
      return response;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin gia sư:', error);
      return null;
    }
  };
const getReviewsByTutor = async (tutorId) => {
    try {
      const response = await axios.get(`/api/tutor/review/${tutorId}`);
      return response;
    } catch (error) {
      console.error("Error fetching reviews by tutor:", error);
      throw error;
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
export {getTutorById,getReviewsByTutor}  
