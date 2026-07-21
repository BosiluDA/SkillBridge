import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import '../App.css';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, exchangeRes] = await Promise.all([
        API.get('/auth/me'),
        API.get('/exchanges')
      ]);
      const userData = userRes.data.user || userRes.data;
      const exchangeData = Array.isArray(exchangeRes.data) ? exchangeRes.data : (exchangeRes.data.exchanges || []);
      setUser(userData);
      setExchanges(exchangeData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="page-wrapper">
      <Navbar />
      <div className="page-content"><p className="text-muted">Loading...</p></div>
    </div>
  );

  if (!user) return null;

  const completed = exchanges.filter(e => e.status === 'completed').length;

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="page-content">
        <h1 className="page-title">Welcome back, {user.name}! 👋</h1>
        <p className="text-muted">Here's what's happening with your skill exchanges.</p>

        <div className="grid-3 mt-2">
          <div className="card text-center">
            <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)' }}>{exchanges.length}</h2>
            <p className="text-muted">Total Exchanges</p>
          </div>
          <div className="card text-center">
            <h2 style={{ fontSize: '2.5rem', color: 'var(--success)' }}>{completed}</h2>
            <p className="text-muted">Completed</p>
          </div>
          <div className="card text-center">
            <h2 style={{ fontSize: '2.5rem', color: 'var(--accent)' }}>
              {user.assignedGroup === 'A'
                ? (user.simpleScore || 0).toFixed(1)
                : (user.weightedScore || 0).toFixed(1)}
            </h2>
            <p className="text-muted">Trust Score (Group {user.assignedGroup})</p>
          </div>
        </div>

        <div className="grid-2 mt-2">
          <div className="card">
            <h3 className="mb-1">Your Skills</h3>
            {user.skillsOffered?.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {user.skillsOffered.map((s, i) => (
                  <span key={i} className="badge badge-primary">{s}</span>
                ))}
              </div>
            ) : (
              <p className="text-muted">No skills added yet.{' '}
                <span className="link" onClick={() => navigate('/profile')}>Update your profile</span>
              </p>
            )}
          </div>
          <div className="card">
            <h3 className="mb-1">Skills Wanted</h3>
            {user.skillsWanted?.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {user.skillsWanted.map((s, i) => (
                  <span key={i} className="badge badge-accent">{s}</span>
                ))}
              </div>
            ) : (
              <p className="text-muted">No skills added yet.{' '}
                <span className="link" onClick={() => navigate('/profile')}>Update your profile</span>
              </p>
            )}
          </div>
        </div>

        <div className="card mt-2">
          <h3 className="mb-1">Quick Actions</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => navigate('/browse')}>
              Browse Skills
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/exchanges')}>
              My Exchanges
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/profile')}>
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;