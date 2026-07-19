import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import '../App.css';

function Exchanges() {
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { fetchExchanges(); }, []);

  const fetchExchanges = async () => {
    try {
      const res = await API.get('/exchanges');
      setExchanges(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError('Failed to load exchanges');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/exchanges/${id}/status`, { status });
      fetchExchanges();
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: 'badge-primary',
      accepted: 'badge-success',
      completed: 'badge-accent',
      rejected: 'badge-danger'
    };
    return map[status] || 'badge-primary';
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="page-content">
        <h1 className="page-title">My Exchanges</h1>
        <p className="text-muted">Manage your skill exchange requests</p>

        {error && <div className="error mt-1">{error}</div>}

        {loading ? (
          <p className="text-muted mt-2">Loading exchanges...</p>
        ) : exchanges.length === 0 ? (
          <div className="card mt-2 text-center">
            <p className="text-muted">No exchanges yet.</p>
            <button className="btn btn-primary mt-1" style={{ width: 'auto', padding: '0.75rem 2rem' }}
              onClick={() => navigate('/browse')}>
              Browse Skills
            </button>
          </div>
        ) : (
          <div style={{ marginTop: '1.5rem' }}>
            {exchanges.map(ex => {
              const isRequester = ex.requester?._id === currentUser._id;
              const otherUser = isRequester ? ex.receiver : ex.requester;
              return (
                <div key={ex._id} className="card">
                  <div className="flex-between">
                    <div>
                      <h3>{isRequester ? `You → ${otherUser?.name}` : `${otherUser?.name} → You`}</h3>
                      <p className="text-muted" style={{ marginTop: '0.25rem' }}>{ex.message}</p>
                    </div>
                    <span className={`badge ${getStatusBadge(ex.status)}`}>
                      {ex.status}
                    </span>
                  </div>

                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {!isRequester && ex.status === 'pending' && (
                      <>
                        <button className="btn btn-success btn-sm" onClick={() => updateStatus(ex._id, 'accepted')}>
                          Accept
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => updateStatus(ex._id, 'rejected')}>
                          Reject
                        </button>
                      </>
                    )}
                    {ex.status === 'accepted' && (
                      <>
                        <button className="btn btn-success btn-sm" onClick={() => updateStatus(ex._id, 'completed')}>
                          Mark Complete
                        </button>
                        <button className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/messages?exchangeId=${ex._id}`)}>
                          Message
                        </button>
                      </>
                    )}
                    {ex.status === 'completed' && (
                      <button className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/rating?exchangeId=${ex._id}&userId=${otherUser?._id}`)}>
                        Leave Rating
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Exchanges;
