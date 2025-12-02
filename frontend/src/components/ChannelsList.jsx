import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { channelsAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import CreateChannelModal from './CreateChannelModal';
import './ChannelsList.css';

export default function ChannelsList() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { channelId } = useParams();

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      setLoading(true);
      const response = await channelsAPI.getAll();
      setChannels(response.data);
    } catch (error) {
      console.error('Failed to load channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChannelClick = (id) => {
    navigate(`/channel/${id}`);
  };

  const handleJoinChannel = async (channelId, e) => {
    e.stopPropagation();
    try {
      await channelsAPI.join(channelId);
      loadChannels();
    } catch (error) {
      console.error('Failed to join channel:', error);
      alert(error.response?.data?.message || 'Failed to join channel');
    }
  };

  const handleLeaveChannel = async (channelId, e) => {
    e.stopPropagation();
    try {
      await channelsAPI.leave(channelId);
      loadChannels();
      if (channelId === channelId) {
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to leave channel:', error);
      alert(error.response?.data?.message || 'Failed to leave channel');
    }
  };

  const isMember = (channel) => {
    return channel.members?.some((member) => 
      (typeof member === 'object' ? member._id : member) === user?.id
    );
  };

  const handleChannelCreated = () => {
    setShowCreateModal(false);
    loadChannels();
  };

  if (loading) {
    return <div className="channels-loading">Loading channels...</div>;
  }

  return (
    <div className="channels-list">
      <div className="channels-header">
        <h2>Channels</h2>
        <button
          className="btn-create-channel"
          onClick={() => setShowCreateModal(true)}
        >
          + Create Channel
        </button>
      </div>
      <div className="channels-items">
        {channels.length === 0 ? (
          <div className="no-channels">No channels yet. Create one!</div>
        ) : (
          channels.map((channel) => {
            const member = isMember(channel);
            return (
              <div
                key={channel._id}
                className={`channel-item ${channelId === channel._id ? 'active' : ''}`}
                onClick={() => handleChannelClick(channel._id)}
              >
                <div className="channel-info">
                  <span className="channel-name"># {channel.name}</span>
                  {channel.description && (
                    <span className="channel-description">{channel.description}</span>
                  )}
                  <span className="channel-members">
                    {channel.members?.length || 0} members
                  </span>
                </div>
                {member ? (
                  <button
                    className="btn-leave"
                    onClick={(e) => handleLeaveChannel(channel._id, e)}
                  >
                    Leave
                  </button>
                ) : (
                  <button
                    className="btn-join"
                    onClick={(e) => handleJoinChannel(channel._id, e)}
                  >
                    Join
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
      {showCreateModal && (
        <CreateChannelModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleChannelCreated}
        />
      )}
    </div>
  );
}

