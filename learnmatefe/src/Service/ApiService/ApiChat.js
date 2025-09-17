import { toast } from 'react-toastify';
import axios from '../AxiosCustomize';
import Cookies from 'js-cookie';
const ApiCreateConversation = async (receiverId) => {
    const response = await axios.post('/conversation', { receiverId });
    return response;
  };
  


  export{ApiCreateConversation}