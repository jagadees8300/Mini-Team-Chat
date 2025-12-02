import { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ChannelsList from './ChannelsList';
import ChatView from './ChatView';
import './MainLayout.css';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="main-layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>Team Chat</h1>
          <div className="user-info">
            <span>{user?.username}</span>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
        <ChannelsList />
      </div>
      <div className="main-content">
        <Routes>
          <Route path="/" element={<div className="welcome-message">Select a channel to start chatting</div>} />
          <Route path="/channel/:channelId" element={<ChatView />} />
        </Routes>
      </div>
    </div>
  );
}

