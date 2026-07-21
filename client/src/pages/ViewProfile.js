import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import '../App.css';

function ViewProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProfile = async () => {
    try {
      const [userRes, reviewRes] = await Promise.all([
        API.get(`/users/${id}`),
        API.get(`/reviews/user/${id}`)
      ]);
      setUser(userRes.data.user || userRes.data);
      const reviewData = Array.isArray(reviewRes.data) ? reviewRes.data : (reviewRes.data.reviews || []);
      setReviews(reviewData);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [1,2,3,4,5].map(star => (
      <span key={star} className={`star ${star <= rating ? '' : 'inactive'}`} style={{ fontSize: '1rem', cursor: 'default' }}>★</span>
    ));
  };

  if (loading) return (
    <div className="page-wrapper">
      <Navbar />
      <div className="page-content"><p className="text-muted">Loading profile...</p></div>
    </div>
  );

  if (!user) return (
    <div className="page-wrapper">
      <Navbar />
      <div className="page-content"><p className="text-muted">User not found.</p></div>
    </div>
  );

  const isOwnProfile = user._id === currentUser._id;

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="page-content">
        <button className="btn btn-secondary btn-sm" style={{ marginBottom: '1rem' }} onClick={() => navigate(-1)}>
          ← Back
        </button>

        {/* Profile Header */}
        <div className="card">
          <div className="flex-between">
            <div>
              <h1 className="page-title">{user.name}</h1>
              <p className="text-muted">{user.location || 'Location not set'}</p>
              {user.bio && <p style={{ marginTop: '0.75rem' }}>{user.bio}</p>}
            </div>
            <div className="text-center">
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'var(--primary)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', color: 'white', fontWeight: 700
              }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <span className={`badge ${user.assignedGroup === 'A' ? 'badge-primary' : 'badge-accent'}`}>
                  Group {user.assignedGroup}
                </span>
              </div>
            </div>
          </div>

          <div className="grid-3 mt-2">
            <div className="text-center">
              <h3 style={{ color: 'var(--primary)', fontSize: '1.5rem' }}>
                {(user.simpleScore || 0).toFixed(1)}
              </h3>
              <p className="text-muted" style={{ fontSize: '0.8rem' }}>Simple Score</p>
            </div>
            <div className="text-center">
              <h3 style={{ color: 'var(--accent)', fontSize: '1.5rem' }}>
                {(user.weightedScore || 0).toFixed(1)}
              </h3>
              <p className="text-muted" style={{ fontSize: '0.8rem' }}>Weighted Score</p>
            </div>
            <div className="text-center">
              <h3 style={{ color: 'var(--success)', fontSize: '1.5rem' }}>
                {user.completedExchanges || 0}
              </h3>
              <p className="text-muted" style={{ fontSize: '0.8rem' }}>Completed Exchanges</p>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="grid-2 mt-2">
          <div className="card">
            <h3 className="mb-1">Skills Offered</h3>
            {user.skillsOffered?.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {user.skillsOffered.map((s, i) => (
                  <span key={i} className="badge badge-primary">{s}</span>
                ))}
              </div>
            ) : (
              <p className="text-muted">No skills listed</p>
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
              <p className="text-muted">No skills listed</p>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="card mt-2">
          <div className="flex-between mb-1">
            <h3>Reviews ({reviews.length})</h3>
            {!isOwnProfile && (
              <button className="btn btn-primary btn-sm" style={{ width: 'auto' }}
                onClick={() => navigate('/browse')}>
                Request Exchange
              </button>
            )}
          </div>

          {reviews.length === 0 ? (
            <p className="text-muted">No reviews yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.map(r => (
                <div key={r._id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                  <div className="flex-between">
                    <div>
                      <strong>{r.reviewer?.name || 'Anonymous'}</strong>
                      <div style={{ display: 'flex', gap: '2px', marginTop: '0.25rem' }}>
                        {renderStars(r.rating)}
                      </div>
                    </div>
                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {r.comment && <p style={{ marginTop: '0.5rem', color: 'var(--muted)' }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewProfile;
