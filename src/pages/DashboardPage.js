import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { setSocket } from '../features/socket/socketSlice';
import { fetchFriends } from '../features/friends/friendsSlice';

const DashboardPage = () => {
  const { user } = useSelector(state => state.auth);
  const { friends, status } = useSelector(state => state.friends);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    dispatch(fetchFriends());

    const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
    dispatch(setSocket(socket));
    socket.emit('join', user._id || user.id);

    return () => {
      socket.disconnect();
    };
  }, [user, navigate, dispatch]);

  if (!user) return null;

  const handleVsComputer = () => {
    // Navigate or show modal for category selection
    alert("Coming soon: VS Computer Mode");
  };

  const handleVsFriend = () => {
    // Could open a modal with friend list or invite dialog
    alert("Select a friend to play with.");
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Welcome, {user.username}!</h1>
      
      <div style={{
        display: 'flex',
        gap: '20px',
        marginTop: '20px'
      }}>
        {/* Friends Section */}
        <div style={{
          flex: 1,
          border: '1px solid #ddd',
          padding: '15px',
          borderRadius: '5px'
        }}>
          <h2>Friends</h2>
          {status === 'loading' ? (
            <p>Loading...</p>
          ) : friends.length === 0 ? (
            <p>No friends yet.</p>
          ) : (
            <ul>
              {friends.map(friend => (
                <li key={friend._id}>
                  {friend.username} {friend.online ? '🟢' : '⚪'}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Game Options */}
        <div style={{
          flex: 1,
          border: '1px solid #ddd',
          padding: '15px',
          borderRadius: '5px'
        }}>
          <h2>Game Options</h2>
          <button onClick={handleVsComputer} style={buttonStyle('green')}>
            Play vs Computer
          </button>
          <button onClick={handleVsFriend} style={buttonStyle('blue')}>
            Play vs Friend
          </button>
        </div>
      </div>
    </div>
  );
};

const buttonStyle = (color) => ({
  padding: '10px 15px',
  margin: '5px',
  backgroundColor: color === 'green' ? '#4CAF50' : '#2196F3',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
});

export default DashboardPage;
