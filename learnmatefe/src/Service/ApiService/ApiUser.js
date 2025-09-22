import { toast } from 'react-toastify';
import axios from '../AxiosCustomize';
import Cookies from 'js-cookie';
const getUserBalance = async () => {
    try {
      const token = Cookies.get("accessToken");
  
      if (!token) {
        console.warn("Không có token, không thể lấy số dư người dùng");
        return null;
      }
  
      const response = await axios.get('/me/info', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.user?.balance !== undefined) {
        return response.user.balance;
      } else {
        throw new Error("Không có thông tin số dư trong phản hồi");
      }
    } catch (error) {
      console.error("Lỗi khi lấy số dư người dùng:", error);
      return null;
    }
  };

  export{getUserBalance}