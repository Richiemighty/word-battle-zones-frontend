import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchFriends } from '../features/friends/friendsSlice';
import { searchUsers, sendFriendRequest, clearSearchResults } from '../features/search/searchSlice';
import { initializeSocket } from '../services/socketManager';
import { fetchFriendRequests } from '../features/friendRequests/friendRequestsSlice';
import { respondToFriendRequest } from '../features/friends/friendRequestsSlice';
import axios from 'axios';

function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const DashboardPage = () => {
  const auth = useSelector(state => state.auth);
  const user = auth.user?.user;

  const { friends } = useSelector(state => state.friends);
  const { results: searchResults, loading: searchLoading, error: searchError } = useSelector(state => state.search);
  const { requests: incomingRequests, status: requestStatus } = useSelector(state => state.friendRequests);
  const { isConnected, onlineUsers } = useSelector(state => state.socket);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    dispatch(fetchFriends());
    dispatch(fetchFriendRequests());
    initializeSocket(user._id || user.id);

    const intervalId = setInterval(() => {
      dispatch(fetchFriends());
    }, 10000);

    const handleUnload = () => {
      const token = user?.token;
      if (token) {
        navigator.sendBeacon(
          `${process.env.REACT_APP_API_URL}/api/users/logout`,
          new Blob([], { type: 'application/json' })
        );
      }
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('beforeunload', handleUnload);
      dispatch(clearSearchResults());
    };
  }, [user, navigate, dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      dispatch(searchUsers(searchQuery));
    } else {
      dispatch(clearSearchResults());
    }
  };

  const handleSendRequest = (userId) => {
    dispatch(sendFriendRequest(userId));
  };

  const handleRespondToRequest = async (requestId, action) => {
    try {
      await dispatch(respondToFriendRequest({ requestId, action })).unwrap();
      dispatch(fetchFriendRequests());
      dispatch(fetchFriends());
    } catch (error) {
      console.error('Error responding to friend request:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/logout`, { userId: user._id || user.id });
      localStorage.removeItem('token');
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleStartGameWithFriend = (friendId) => {
    alert(`Game invitation sent to friend ${friendId}`);
  };

  if (!user) return null;

  const friendsWithStatus = friends?.map(friend => ({
    ...friend,
    online: friend.online
  })) || [];

  return (
    <div style={styles.container}>
      <div style={styles.overlay}>
        <div style={styles.header}>
          <h1 style={styles.heading}>🎮 Welcome, {user.username}!</h1>
          <div style={styles.statusBar}>
            <span style={{
              ...styles.connectionStatus,
              backgroundColor: isConnected ? '#4CAF50' : '#f44336'
            }}>
              {isConnected ? '🟢 Online' : '🔴 Offline'}
            </span>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search for users"
            style={styles.searchInput}
          />
          <button type="submit" style={styles.actionButton}>
            {searchLoading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* SEARCH RESULTS */}
        {searchError && <p style={{ color: 'red' }}>{searchError}</p>}
        {searchResults?.length > 0 && (
          <ul style={styles.resultList}>
            {searchResults.map(userResult => {
              const isFriend = (friends || []).some(f => f._id === userResult._id);
              const requestSent = userResult.requestSent;
              const isOnline = onlineUsers.includes(userResult._id);

              return (
                <li key={userResult._id} style={styles.card}>
                  <strong>{userResult.username}</strong>
                  {isOnline && <span style={{ color: 'lime' }}> • Online</span>}
                  <div>
                    {isFriend ? (
                      <span style={{ color: 'gray' }}>Friend</span>
                    ) : requestSent ? (
                      <span style={{ color: 'orange' }}>Request Sent</span>
                    ) : (
                      <button
                        onClick={() => handleSendRequest(userResult._id)}
                        style={styles.greenButton}>
                        Add Friend
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* MAIN DASHBOARD */}
        <div style={styles.dashboard}>
          {/* FRIENDS */}
          <div style={styles.panel}>
            <h2 style={styles.panelTitle}>Friends ({friendsWithStatus.length})</h2>
            {friendsWithStatus.length === 0 ? (
              <p style={styles.mutedText}>No friends yet. Start searching!</p>
            ) : (
              <ul style={styles.resultList}>
                {friendsWithStatus.map(friend => (
                  <li key={friend._id} style={styles.card}>
                    <span>{friend.username}</span>
                    <div>
                      <span>{friend.online ? '🟢' : '⚪'}</span>
                      {friend.online && (
                        <button onClick={() => handleStartGameWithFriend(friend._id)} style={styles.purpleButton}>
                          Play
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* GAME OPTIONS */}
          <div style={styles.panel}>
            <h2 style={styles.panelTitle}>Game Modes</h2>
            <button style={styles.greenButton} onClick={() => alert("Coming soon: VS AI")}>VS Computer</button>
            <button style={styles.blueButton} onClick={() => {
              if (friendsWithStatus.length === 0) {
                alert("Add friends to play!");
              } else {
                alert("Select a friend from your list");
              }
            }}>VS Friend</button>
          </div>
        </div>

        {/* FRIEND REQUESTS */}
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Friend Requests</h2>
          {requestStatus === 'loading' ? (
            <p style={styles.mutedText}>Loading...</p>
          ) : incomingRequests?.length === 0 ? (
            <p style={styles.mutedText}>No new requests.</p>
          ) : (
            <ul style={styles.resultList}>
              {incomingRequests.map(req => (
                <li key={req._id} style={styles.card}>
                  <span><strong>{toTitleCase(req.username)}</strong> sent a request</span>
                  <div>
                    <button onClick={() => handleRespondToRequest(req._id, 'accept')} style={styles.greenButton}>Accept</button>
                    <button onClick={() => handleRespondToRequest(req._id, 'reject')} style={styles.redButton}>Reject</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'url("https://wallpapercave.com/wp/wp6956804.jpg") no-repeat center center / cover',
    padding: '20px',
    fontFamily: 'Poppins, sans-serif',
    display: 'flex',
    justifyContent: 'center'
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: '30px',
    borderRadius: '15px',
    width: '100%',
    maxWidth: '1100px',
    color: '#fff',
    animation: 'fadeIn 0.5s ease-in-out'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: '20px'
  },
  heading: {
    fontSize: '2rem'
  },
  statusBar: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  connectionStatus: {
    padding: '5px 10px',
    borderRadius: '5px',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#f44336',
    border: 'none',
    borderRadius: '5px',
    color: '#fff',
    cursor: 'pointer'
  },
  searchForm: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },
  searchInput: {
    flex: 1,
    padding: '10px',
    borderRadius: '5px',
    border: 'none',
    fontSize: '16px'
  },
  dashboard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginTop: '20px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },
  panel: {
    backgroundColor: '#222',
    padding: '20px',
    borderRadius: '10px',
    flex: 1
  },
  panelTitle: {
    marginBottom: '10px'
  },
  resultList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  card: {
    backgroundColor: '#333',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'transform 0.3s ease',
    animation: 'fadeIn 0.5s'
  },
  mutedText: {
    color: '#aaa'
  },
  actionButton: {
    padding: '10px 15px',
    backgroundColor: '#2196F3',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  greenButton: {
    padding: '8px 14px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginLeft: '10px'
  },
  redButton: {
    padding: '8px 14px',
    backgroundColor: '#f44336',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginLeft: '10px'
  },
  purpleButton: {
    padding: '8px 14px',
    backgroundColor: '#9c27b0',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginLeft: '10px'
  },
  blueButton: {
    padding: '10px 15px',
    backgroundColor: '#03A9F4',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px'
  }
};

export default DashboardPage;
