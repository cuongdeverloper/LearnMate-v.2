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
  
export {getTutorById,getReviewsByTutor}  
