import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import '../App.css';

function Browse() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [requestMsg, setRequestMsg] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async (q = '') => {
    setLoading(true);
    try {
      const url = q ? `/users?search=${q}` : '/users';
      const res = await API.get(url);
      const data = Array.isArray(res.data) ? res.data : (res.data.users || []);
      setUsers(data.filter(u => u._id !== currentUser._id));
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchUsers(e.target.value);
  };

  const sendRequest = async (toUser) => {
    setError('');
    setSuccess('');
    try {
      await API.post('/exchanges', {
        receiver: toUser._id,
        message: requestMsg || `Hi ${toUser.name}, I'd love to exchange skills with you!`
      });
      setSuccess(`Exchange request sent to ${toUser.name}!`);
      setSelected(null);
      setRequestMsg('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send request');
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="page-content">
        <h1 className="page-title">Browse Skills</h1>
        <p className="text-muted">Find people to exchange skills with</p>

        {success && <div className="success-msg mt-1">{success}</div>}
        {error && <div className="error mt-1">{error}</div>}

        <div className="card mt-2">
          <input
            type="text"
            placeholder="Search by skill or name..."
            value={search}
            onChange={handleSearch}
            style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)', borderRadius: '8px', fontSize: '1rem' }}
          />
        </div>

        {loading ? (
          <p className="text-muted">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-muted">No users found.</p>
        ) : (
          <div className="grid-3">
            {users.map(u => (
              <div key={u._id} className="card">
                <div className="flex-between mb-1">
                  <h3>{u.name}</h3>
                  <span className="badge badge-primary">
                    {u.trustScore ? u.trustScore.toFixed(1) : '0'} ⭐
                  </span>
                </div>
                <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
                  {u.location || 'Location not set'}
                </p>
                {u.skillsOffered?.length > 0 && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Offers:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {u.skillsOffered.slice(0, 3).map((s, i) => (
                        <span key={i} className="badge badge-primary">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {u.skillsWanted?.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>Wants:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {u.skillsWanted.slice(0, 3).map((s, i) => (
                        <span key={i} className="badge badge-accent">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                <button className="btn btn-primary btn-sm" style={{ width: '100%' }}
                  onClick={() => setSelected(u)}>
                  Request Exchange
                </button>
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div className="card" style={{ width: '480px', margin: 0 }}>
              <h3 className="mb-1">Request Exchange with {selected.name}</h3>
              <div className="form-group">
                <label>Message (optional)</label>
                <textarea rows="3" value={requestMsg} onChange={e => setRequestMsg(e.target.value)}
                  placeholder={`Hi ${selected.name}, I'd love to exchange skills with you!`}
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)', borderRadius: '8px', fontFamily: 'inherit' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => sendRequest(selected)}>
                  Send Request
                </button>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSelected(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Browse;