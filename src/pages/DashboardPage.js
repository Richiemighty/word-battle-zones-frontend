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

  const { friends, status: friendsStatus } = useSelector(state => state.friends);
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
  
    // 🔁 Set interval to refresh friends every 10 seconds
    const intervalId = setInterval(() => {
      dispatch(fetchFriends());
    }, 10000);
  
    // 🚪 Handle tab/browser close to update online status
    const handleUnload = () => {
      const token = user?.token;
      if (token) {
        navigator.sendBeacon(
          '${process.env.REACT_APP_API_URL}/api/users/logout',
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
  
      // ✅ Refresh both requests and friends list after accepting
      dispatch(fetchFriendRequests());
      dispatch(fetchFriends());
    } catch (error) {
      console.error('Error responding to friend request:', error);
    }
  };
    
  const handleLogout = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/logout`, { userId: user._id || user.id });
      // await axios.post('/api/users/logout', { userId: user._id || user.id });

  
      // Optionally clear user state, tokens, etc.
      localStorage.removeItem('token');
      navigate('/auth'); // Redirect to login page
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
    

  const handleStartGameWithFriend = (friendId) => {
    alert(`Game invitation sent to friend ${friendId}`);
  };

  if (!user) return null;

  console.log('Friends:', friends);
  const friendsWithStatus = friends?.map(friend => ({
    ...friend,
    online: friend.online // ← now directly from DB
  })) || [];
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Welcome, {user.username}!</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ 
            padding: '5px 10px',
            backgroundColor: isConnected ? '#4CAF50' : '#f44336',
            color: 'white',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </div>
          <button 
            onClick={handleLogout}
            style={{ 
              padding: '5px 10px', 
              backgroundColor: '#f44336', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>


      {/* Search Bar */}
      <div style={{ marginBottom: '20px' }}>
        <h2>Search Users</h2>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username"
            style={{ 
              padding: '10px', 
              flex: 1, 
              borderRadius: '4px', 
              border: '1px solid #ddd',
              fontSize: '16px'
            }}
          />
          <button 
            type="submit" 
            style={buttonStyle('blue')}
            disabled={searchLoading}
          >
            {searchLoading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {searchError && <p style={{ color: 'red' }}>Error: {searchError}</p>}

        {!searchLoading && searchResults?.length > 0 && (
          <div style={{ 
            marginTop: '10px', 
            border: '1px solid #ddd', 
            borderRadius: '5px', 
            padding: '15px',
            backgroundColor: '#f9f9f9'
          }}>
            <h3>Search Results:</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {searchResults.map(userResult => {
                const isOnline = onlineUsers.includes(userResult._id);
                const isFriend = (friends || []).some(f => f._id === userResult._id);
                const requestSent = userResult.requestSent;

                return (
                  <li 
                    key={userResult._id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '10px',
                      borderBottom: '1px solid #eee',
                      backgroundColor: '#fff'
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 'bold' }}>{userResult.username}</span>
                      {isOnline && <span style={{ marginLeft: '10px', color: 'green' }}>• Online</span>}
                    </div>
                    <div>
                      {isFriend ? (
                        <span style={{ color: 'gray' }}>Already friends</span>
                      ) : requestSent ? (
                        <span style={{ color: 'green' }}>Request sent</span>
                      ) : (
                        <button 
                          onClick={() => handleSendRequest(userResult._id)}
                          style={buttonStyle('green')}
                        >
                          Send Request
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {!searchLoading && searchResults?.length === 0 && searchQuery && (
          <p>No users found matching "{searchQuery}"</p>
        )}
      </div>

      {/* Friend List + Game Options */}

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>

        <div style={{
          flex: 1,
          border: '1px solid #ddd',
          padding: '20px',
          borderRadius: '5px',
          backgroundColor: '#f9f9f9'
        }}>
          <h2>Friends ({friendsWithStatus.length})</h2>
          {friendsStatus === 'loading' ? (
            
            <p>Loading friends...</p>
          ) : friendsWithStatus.length === 0 ? (
            <p>No friends yet. Search for users to add friends!</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {friendsWithStatus.map(friend => (
                <li 
                  key={friend._id} 
                  style={{ 
                    padding: '10px',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>{friend.username}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>{friend.online ? '🟢 Online' : '⚪ Offline'}</span>
                    {friend.online && (
                      <button 
                        onClick={() => handleStartGameWithFriend(friend._id)}
                        style={buttonStyle('purple')}
                      >
                        Play
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>







        {/* Game Options */}
        <div style={{
          flex: 1,
          border: '1px solid #ddd',
          padding: '20px',
          borderRadius: '5px',
          backgroundColor: '#f9f9f9'
        }}>
          <h2>Game Options</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={() => alert("Coming soon: VS Computer Mode")} 
              style={buttonStyle('green')}
            >
              Play vs Computer
            </button>
            <button 
              onClick={() => {
                if (friendsWithStatus.length === 0) {
                  alert("You need to add friends first!");
                } else {
                  alert("Select a friend from your friends list to play with");
                }
              }} 
              style={buttonStyle('blue')}
            >
              Play vs Friend
            </button>
          </div>
        </div>
      </div>

      {/* Incoming Requests */}
      <div style={{
        marginTop: '30px',
        border: '1px solid #ddd',
        padding: '20px',
        borderRadius: '5px',
        backgroundColor: '#f9f9f9'
      }}>
        <h2>Incoming Friend Requests</h2>

        {requestStatus === 'loading' ? (
          <p>Loading requests...</p>
        ) : !incomingRequests || incomingRequests.length === 0 ? (
          <p>No new friend requests.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {Array.isArray(incomingRequests) &&
              incomingRequests.map((req) => (
                <li
                  key={req._id}
                  style={{
                    padding: '10px',
                    borderBottom: '1px solid #ccc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>
                    <strong>{req.username ? toTitleCase(req.username) : 'Unknown User'}</strong> sent you a friend request
                  </span>
                  <div>
                    <button
                      onClick={() => handleRespondToRequest(req._id, 'accept')}
                      style={buttonStyle('green')}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespondToRequest(req._id, 'reject')}
                      style={buttonStyle('red')}
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))
            }
          </ul>
        )}
      </div>


    </div>
  );
};

const buttonStyle = (color) => ({
  padding: '10px 15px',
  backgroundColor: 
    color === 'green' ? '#4CAF50' : 
    color === 'blue' ? '#2196F3' :
    color === 'purple' ? '#9c27b0' :
    color === 'red' ? '#f44336' : '#555',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '16px'
});

export default DashboardPage;