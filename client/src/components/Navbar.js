import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <span className="navbar-brand">SkillBridge</span>
      <ul className="navbar-links">
        <li><span className="link" style={{color:'white'}} onClick={() => navigate('/dashboard')}>Dashboard</span></li>
        <li><span className="link" style={{color:'white'}} onClick={() => navigate('/browse')}>Browse</span></li>
        <li><span className="link" style={{color:'white'}} onClick={() => navigate('/exchanges')}>Exchanges</span></li>
        <li><span className="link" style={{color:'white'}} onClick={() => navigate('/messages')}>Messages</span></li>
        <li><span className="link" style={{color:'white'}} onClick={() => navigate('/profile')}>Profile</span></li>
        <li><span className="link" style={{color:'#FF6B35'}} onClick={logout}>Logout</span></li>
      </ul>
    </nav>
  );
}

export default Navbar;
