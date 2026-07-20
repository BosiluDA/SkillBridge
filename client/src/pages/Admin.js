import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import '../App.css';

function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAll = async () => {
    try {
      const [statsRes, usersRes, exchangesRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
        API.get('/admin/exchanges')
      ]);
      setStats(statsRes.data);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data.users || []));
      setExchanges(Array.isArray(exchangesRes.data) ? exchangesRes.data : (exchangesRes.data.exchanges || []));
    } catch (err) {
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await API.get('/admin/export');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'skillbridge_export.json';
      a.click();
    } catch (err) {
      setError('Export failed');
    }
  };

  const tabStyle = (tab) => ({
    padding: '0.6rem 1.5rem',
    border: 'none',
    borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
    background: 'none',
    fontWeight: activeTab === tab ? 700 : 400,
    color: activeTab === tab ? 'var(--primary)' : 'var(--muted)',
    cursor: 'pointer',
    fontSize: '1rem'
  });

  if (loading) return (
    <div className="page-wrapper">
      <Navbar />
      <div className="page-content"><p className="text-muted">Loading admin panel...</p></div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="page-content">
        <div className="flex-between mb-1">
          <div>
            <h1 className="page-title">Admin Panel</h1>
            <p className="text-muted">Manage and monitor SkillBridge</p>
          </div>
          <button className="btn btn-success" style={{ width: 'auto' }} onClick={handleExport}>
            📥 Export Data
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {/* Tabs */}
        <div style={{ borderBottom: '1px solid var(--border)', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
          <button style={tabStyle('overview')} onClick={() => setActiveTab('overview')}>Overview</button>
          <button style={tabStyle('users')} onClick={() => setActiveTab('users')}>Users</button>
          <button style={tabStyle('exchanges')} onClick={() => setActiveTab('exchanges')}>Exchanges</button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <>
            <div className="grid-3">
              <div className="card text-center">
                <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)' }}>{stats.totalUsers || 0}</h2>
                <p className="text-muted">Total Users</p>
              </div>
              <div className="card text-center">
                <h2 style={{ fontSize: '2.5rem', color: 'var(--accent)' }}>{stats.totalExchanges || 0}</h2>
                <p className="text-muted">Total Exchanges</p>
              </div>
              <div className="card text-center">
                <h2 style={{ fontSize: '2.5rem', color: 'var(--success)' }}>{stats.totalReviews || 0}</h2>
                <p className="text-muted">Total Reviews</p>
              </div>
            </div>

            <div className="grid-2 mt-2">
              <div className="card">
                <h3 className="mb-1">Group Distribution</h3>
                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '1rem' }}>
                  <div className="text-center">
                    <h2 style={{ fontSize: '2rem', color: 'var(--primary)' }}>{stats.groupA || 0}</h2>
                    <p className="text-muted">Group A</p>
                    <span className="badge badge-primary">Simple Rating</span>
                  </div>
                  <div className="text-center">
                    <h2 style={{ fontSize: '2rem', color: 'var(--accent)' }}>{stats.groupB || 0}</h2>
                    <p className="text-muted">Group B</p>
                    <span className="badge badge-accent">Weighted Score</span>
                  </div>
                </div>
              </div>
              <div className="card">
                <h3 className="mb-1">Exchange Status</h3>
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {['pending', 'accepted', 'completed', 'rejected'].map(status => (
                    <div key={status} className="flex-between">
                      <span style={{ textTransform: 'capitalize' }}>{status}</span>
                      <span className={`badge badge-${status === 'accepted' || status === 'completed' ? 'success' : status === 'rejected' ? 'danger' : 'primary'}`}>
                        {exchanges.filter(e => e.status === status).length}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="card">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Group</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Simple Score</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Weighted Score</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Exchanges</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Admin</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem' }}>{u.name}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--muted)', fontSize: '0.9rem' }}>{u.email}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <span className={`badge ${u.assignedGroup === 'A' ? 'badge-primary' : 'badge-accent'}`}>
                        Group {u.assignedGroup}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{u.simpleScore || 0}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{u.weightedScore || 0}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{u.totalExchanges || 0}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {u.isAdmin ? '✅' : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Exchanges Tab */}
        {activeTab === 'exchanges' && (
          <div className="card">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Requester</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Receiver</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Message</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {exchanges.map(ex => (
                  <tr key={ex._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem' }}>{ex.requester?.name || 'N/A'}</td>
                    <td style={{ padding: '0.75rem' }}>{ex.receiver?.name || 'N/A'}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--muted)', fontSize: '0.9rem', maxWidth: '200px' }}>
                      {ex.message?.substring(0, 50)}...
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <span className={`badge badge-${ex.status === 'accepted' || ex.status === 'completed' ? 'success' : ex.status === 'rejected' ? 'danger' : 'primary'}`}>
                        {ex.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--muted)' }}>
                      {new Date(ex.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
