import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import '../App.css';

function Rating() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const exchangeId = params.get('exchangeId');
  const userId = params.get('userId');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return setError('Please select a rating');
    setLoading(true);
    setError('');
    try {
      await API.post('/reviews', {
        reviewee: userId,
        exchange: exchangeId,
        rating,
        comment
      });
      setSuccess('Rating submitted successfully!');
      setTimeout(() => navigate('/exchanges'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="page-content">
        <div className="container-small" style={{ margin: '2rem auto' }}>
          <div className="card">
            <h1 className="page-title">Leave a Rating</h1>
            <p className="text-muted mt-1">How was your skill exchange experience?</p>

            {success && <div className="success-msg mt-1">{success}</div>}
            {error && <div className="error mt-1">{error}</div>}

            <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
              <div className="form-group">
                <label>Rating</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      className={`star ${star <= (hover || rating) ? '' : 'inactive'}`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                    >
                      ★
                    </span>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-muted" style={{ marginTop: '0.5rem' }}>
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>Comment (optional)</label>
                <textarea
                  rows="4"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Share your experience..."
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)', borderRadius: '8px', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-primary" type="submit" style={{ flex: 1 }} disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Rating'}
                </button>
                <button className="btn btn-secondary" type="button" style={{ flex: 1 }}
                  onClick={() => navigate('/exchanges')}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Rating;
