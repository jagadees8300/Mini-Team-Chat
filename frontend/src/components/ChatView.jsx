import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { channelsAPI, messagesAPI } from '../api';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import OnlineUsers from './OnlineUsers';
import './ChatView.css';

export default function ChatView() {
  const { channelId } = useParams();
  const [channel, setChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const { socket, joinChannel, leaveChannel } = useSocket();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (channelId) {
      loadChannel();
      loadMessages();
      joinChannel(channelId);

      // Listen for new messages
      if (socket) {
        const handleNewMessage = (message) => {
          const msgChannelId = message.channel?._id || message.channel;
          if (msgChannelId === channelId || msgChannelId?.toString() === channelId) {
            setMessages((prev) => [...prev, message]);
            scrollToBottom();
          }
        };

        socket.on('new-message', handleNewMessage);

        return () => {
          socket.off('new-message', handleNewMessage);
          leaveChannel(channelId);
        };
      }
    }
  }, [channelId, socket]);

  const loadChannel = async () => {
    try {
      const response = await channelsAPI.getOne(channelId);
      setChannel(response.data);
    } catch (error) {
      console.error('Failed to load channel:', error);
    }
  };

  const loadMessages = async (page = 1) => {
    try {
      setLoading(true);
      const response = await messagesAPI.getByChannel(channelId, page, 50);
      const { messages: newMessages, pagination: paginationData } = response.data;

      if (page === 1) {
        setMessages(newMessages);
      } else {
        setMessages((prev) => [...newMessages, ...prev]);
      }

      setPagination(paginationData);
      if (page === 1) {
        scrollToBottom();
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages) {
      loadMessages(pagination.page + 1);
    }
  };


  if (loading && !channel) {
    return <div className="chat-loading">Loading channel...</div>;
  }

  if (!channel) {
    return <div className="chat-error">Channel not found</div>;
  }

  return (
    <div className="chat-view">
      <div className="chat-header">
        <div className="channel-header-info">
          <h2># {channel.name}</h2>
          {channel.description && <p className="channel-desc">{channel.description}</p>}
          <span className="member-count">{channel.members?.length || 0} members</span>
        </div>
        <OnlineUsers channelId={channelId} />
      </div>
      <div className="chat-messages-container">
        {pagination.page < pagination.totalPages && (
          <div className="load-more-container">
            <button onClick={handleLoadMore} className="btn-load-more">
              Load older messages
            </button>
          </div>
        )}
        <MessageList messages={messages} currentUserId={user?.id} />
        <div ref={messagesEndRef} />
      </div>
      <MessageInput channelId={channelId} />
    </div>
  );
}

