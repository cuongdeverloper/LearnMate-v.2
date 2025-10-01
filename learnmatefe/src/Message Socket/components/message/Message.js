import "./Message.scss";
import formatTimeAgo from "../../../components/FormatTimeAgo"
import ImageUser from "../../../public/avatar.jpg"
const Message = ({ message, own,sender }) =>{
  return (
    <div className={own ? "message own" : "message"}>
      <p className="messageBottom">{formatTimeAgo(message.createdAt).toLocaleString()}</p>
      <div className="messageTop">
        <img
          className="messageImg"
          src={sender.image || ImageUser}
          alt="img"
        />
        <p className="messageText">{message.text}</p>
      </div>
    </div>
  );
}
export default Message