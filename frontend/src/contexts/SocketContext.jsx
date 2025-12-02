import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      const newSocket = io(API_URL, {
        auth: {
          token: token,
        },
        transports: ['websocket', 'polling'],
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('Socket connected');
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Socket disconnected');
      });

      newSocket.on('online-users', (users) => {
        setOnlineUsers(users);
      });

      newSocket.on('user-online', (user) => {
        setOnlineUsers((prev) => {
          if (prev.find((u) => u.userId === user.userId)) {
            return prev;
          }
          return [...prev, user];
        });
      });

      newSocket.on('user-offline', (user) => {
        setOnlineUsers((prev) => prev.filter((u) => u.userId !== user.userId));
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers([]);
      }
    }
  }, [isAuthenticated, token]);

  const joinChannel = (channelId) => {
    if (socket && isConnected) {
      socket.emit('join-channel', { channelId });
    }
  };

  const leaveChannel = (channelId) => {
    if (socket && isConnected) {
      socket.emit('leave-channel', { channelId });
    }
  };

  const sendMessage = (content, channelId) => {
    if (socket && isConnected) {
      socket.emit('send-message', { content, channelId });
    }
  };

  const startTyping = (channelId) => {
    if (socket && isConnected) {
      socket.emit('typing-start', { channelId });
    }
  };

  const stopTyping = (channelId) => {
    if (socket && isConnected) {
      socket.emit('typing-stop', { channelId });
    }
  };

  const value = {
    socket,
    isConnected,
    onlineUsers,
    joinChannel,
    leaveChannel,
    sendMessage,
    startTyping,
    stopTyping,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

