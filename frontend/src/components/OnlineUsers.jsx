import { useSocket } from '../contexts/SocketContext';
import './OnlineUsers.css';

export default function OnlineUsers({ channelId }) {
  const { onlineUsers } = useSocket();

  if (!onlineUsers || onlineUsers.length === 0) {
    return (
      <div className="online-users">
        <h3>Online Users</h3>
        <div className="no-online-users">No users online</div>
      </div>
    );
  }

  return (
    <div className="online-users">
      <h3>Online Users ({onlineUsers.length})</h3>
      <div className="online-users-list">
        {onlineUsers.map((user) => (
          <div key={user.userId} className="online-user-item">
            <span className="online-indicator"></span>
            <span>{user.username || user.email}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

