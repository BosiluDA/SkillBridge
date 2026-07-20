import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import '../App.css';

function Messages() {
  const [exchanges, setExchanges] = useState([]);
  const [selectedExchange, setSelectedExchange] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [error, setError] = useState('');
  const location = useLocation();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchExchanges();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const exchangeId = params.get('exchangeId');
    if (exchangeId && exchanges.length > 0) {
      const ex = exchanges.find(e => e._id === exchangeId);
      if (ex) selectExchange(ex);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exchanges, location.search]);

  const fetchExchanges = async () => {
    try {
      const res = await API.get('/exchanges');
      const data = Array.isArray(res.data) ? res.data : [];
      setExchanges(data.filter(e => e.status === 'accepted' || e.status === 'completed'));
    } catch (err) {}
  };

  const selectExchange = async (ex) => {
    setSelectedExchange(ex);
    try {
      const res = await API.get(`/messages/${ex._id}`);
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {}
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    try {
      await API.post('/messages', {
        exchange: selectedExchange._id,
        content: newMsg
      });
      setNewMsg('');
      const res = await API.get(`/messages/${selectedExchange._id}`);
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError('Failed to send message');
    }
  };

  const getOtherUser = (ex) => {
    return ex.requester?._id === currentUser._id ? ex.receiver : ex.requester;
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="page-content">
        <h1 className="page-title">Messages</h1>

        {error && <div className="error">{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div>
            {exchanges.length === 0 ? (
              <div className="card">
                <p className="text-muted">No active exchanges to message in.</p>
              </div>
            ) : (
              exchanges.map(ex => (
                <div key={ex._id} className="card"
                  style={{ cursor: 'pointer', border: selectedExchange?._id === ex._id ? '2px solid var(--primary)' : '2px solid transparent' }}
                  onClick={() => selectExchange(ex)}>
                  <h4>{getOtherUser(ex)?.name}</h4>
                  <span className={`badge ${ex.status === 'completed' ? 'badge-accent' : 'badge-success'}`}>
                    {ex.status}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: '500px' }}>
            {!selectedExchange ? (
              <p className="text-muted">Select an exchange to start chatting.</p>
            ) : (
              <>
                <h3 style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                  Chat with {getOtherUser(selectedExchange)?.name}
                </h3>
                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {messages.length === 0 ? (
                    <p className="text-muted">No messages yet. Say hello!</p>
                  ) : (
                    messages.map(msg => {
                      const isMe = msg.sender?._id === currentUser._id;
                      return (
                        <div key={msg._id} style={{
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                          background: isMe ? 'var(--primary)' : '#f0f0f0',
                          color: isMe ? 'white' : 'var(--dark)',
                          padding: '0.6rem 1rem',
                          borderRadius: '12px',
                          maxWidth: '70%'
                        }}>
                          {msg.content}
                        </div>
                      );
                    })
                  )}
                </div>
                <form onSubmit={sendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={newMsg}
                    onChange={e => setNewMsg(e.target.value)}
                    placeholder="Type a message..."
                    style={{ flex: 1, padding: '0.75rem', border: '2px solid var(--border)', borderRadius: '8px', fontSize: '1rem' }}
                  />
                  <button className="btn btn-primary" type="submit" style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>
                    Send
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Messages;
