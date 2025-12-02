import './MessageList.css';

export default function MessageList({ messages, currentUserId }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <div className="no-messages">No messages yet. Start the conversation!</div>
      ) : (
        messages.map((message) => {
          const isOwn = message.sender?._id === currentUserId || 
                       (typeof message.sender === 'object' && message.sender?._id === currentUserId);
          
          return (
            <div key={message._id} className={`message ${isOwn ? 'own' : ''}`}>
              <div className="message-content">
                <div className="message-header">
                  <span className="message-sender">
                    {message.sender?.username || 'Unknown'}
                  </span>
                  <span className="message-time">
                    {formatTime(message.createdAt || message.timestamp)}
                  </span>
                </div>
                <div className="message-text">{message.content}</div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

