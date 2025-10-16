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
      const res = await axios.get('/api/tutor/active-status', {
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
      const res = await axios.put('/api/tutor/active-status', { active }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res;
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái tutor:", error);
      return { success: false, message: error?.response?.message || "Lỗi cập nhật" };
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
      const response = await axios.post('/api/tutor/application', data, {
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


  

  export const ApiGetMyTutor = async () => {
    try {
      const token = Cookies.get("accessToken");
      const res = await axios.get("/api/tutor/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res;
    } catch (err) {
      throw err.response || err;
    }
  };
  
  export const ApiUpdateTutor = async (tutorId, payload) => {
    try {
      const token = Cookies.get("accessToken");
      const res = await axios.put(`/api/tutor/${tutorId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res;
    } catch (err) {
      throw err.response || err;
    }
  };
  
  export const ApiGetAllSubjects = async () => {
    try {
      const res = await axios.get("/api/tutor/subjects");
      return res;
    } catch (err) {
      throw err.response || err;
    }
  };
export {getTutorById,getReviewsByTutor}  
