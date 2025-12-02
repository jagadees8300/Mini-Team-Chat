import { useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import './MessageInput.css';

export default function MessageInput({ channelId }) {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const { sendMessage } = useSocket();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || sending) return;

    const messageContent = content.trim();
    setContent('');
    setSending(true);
    
    sendMessage(messageContent, channelId);
    
    // Reset sending state after a short delay
    setTimeout(() => {
      setSending(false);
    }, 1000);
  };

  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit} className="message-input-form">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          disabled={sending}
          className="message-input"
        />
        <button
          type="submit"
          disabled={!content.trim() || sending}
          className="btn-send"
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

