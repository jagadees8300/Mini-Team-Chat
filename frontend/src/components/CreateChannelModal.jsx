import { useState } from 'react';
import { channelsAPI } from '../api';
import { useNavigate } from 'react-router-dom';
import './CreateChannelModal.css';

export default function CreateChannelModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await channelsAPI.create({
        name,
        description: description || undefined,
        isPrivate,
      });
      onCreated();
      navigate(`/channel/${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create channel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Channel</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label htmlFor="channel-name">Channel Name *</label>
            <input
              type="text"
              id="channel-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              placeholder="e.g., general"
            />
          </div>
          <div className="form-group">
            <label htmlFor="channel-description">Description</label>
            <textarea
              id="channel-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              placeholder="What is this channel about?"
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                disabled={loading}
              />
              Private channel
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading || !name} className="btn-primary">
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

