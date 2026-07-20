import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import '../App.css';

function Profile() {
  const [form, setForm] = useState({
    name: '', bio: '', skillsOffered: '', skillsWanted: '', location: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/auth/me');
        const u = res.data.user || res.data;
        setForm({
          name: u.name || '',
          bio: u.bio || '',
          skillsOffered: u.skillsOffered?.join(', ') || '',
          skillsWanted: u.skillsWanted?.join(', ') || '',
          location: u.location || ''
        });
      } catch (err) {}
    };
    fetchProfile();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const payload = {
        name: form.name,
        bio: form.bio,
        location: form.location,
        skillsOffered: form.skillsOffered.split(',').map(s => s.trim()).filter(Boolean),
        skillsWanted: form.skillsWanted.split(',').map(s => s.trim()).filter(Boolean),
      };
      const res = await API.put('/users/profile', payload);
      const updatedUser = res.data.user || res.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="page-content">
        <h1 className="page-title">My Profile</h1>
        <p className="text-muted">Update your skills and information</p>

        <div className="card mt-2">
          {message && <div className="success-msg">{message}</div>}
          {error && <div className="error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" name="location" placeholder="e.g. London, UK"
                  value={form.location} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea name="bio" rows="3" placeholder="Tell others about yourself..."
                value={form.bio} onChange={handleChange}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--border)', borderRadius: '8px', fontFamily: 'inherit' }}
              />
            </div>
            <div className="form-group">
              <label>Skills I Can Offer <span className="text-muted">(comma separated)</span></label>
              <input type="text" name="skillsOffered" placeholder="e.g. Python, Guitar, Cooking"
                value={form.skillsOffered} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Skills I Want to Learn <span className="text-muted">(comma separated)</span></label>
              <input type="text" name="skillsWanted" placeholder="e.g. Spanish, Photography"
                value={form.skillsWanted} onChange={handleChange} />
            </div>
            <button className="btn btn-primary" type="submit" style={{ width: 'auto', padding: '0.75rem 2rem' }} disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;