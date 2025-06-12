import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchFriends } from '../features/friends/friendsSlice';
import { searchUsers, sendFriendRequest, clearSearchResults } from '../features/search/searchSlice';
import { initializeSocket } from '../services/socketManager';
import { fetchFriendRequests } from '../features/friendRequests/friendRequestsSlice';
import { respondToFriendRequest } from '../features/friends/friendRequestsSlice';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { keyframes } from 'styled-components';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #f57878;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.5s ease-out;

  h1 {
    font-size: 2rem;
    color: #2c3e50;
    margin: 0;
    background: linear-gradient(to right, #3498db, #9b59b6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
`;

const StatusBadge = styled.div`
  padding: 8px 15px;
  background-color: ${props => props.online ? '#2ecc71' : '#e74c3c'};
  color: white;
  border-radius: 20px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:before {
    content: '';
    display: block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: white;
  }
`;

const Button = styled(motion.button)`
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  color: white;
  background: ${props => 
    props.primary ? '#3498db' : 
    props.success ? '#2ecc71' : 
    props.danger ? '#e74c3c' : 
    props.warning ? '#f39c12' : 
    props.purple ? '#9b59b6' : '#95a5a6'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Card = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  overflow: hidden;
  transition: all 0.3s ease;

  h2 {
    margin-top: 0;
    color: #2c3e50;
    font-size: 1.5rem;
    padding-bottom: 10px;
    border-bottom: 2px solid #f1f1f1;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ListItem = styled(motion.li)`
  padding: 15px;
  margin: 10px 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const SearchInput = styled(motion.input)`
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  flex: 1;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  }
`;

const SearchForm = styled(motion.form)`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const OnlineIndicator = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.online ? '#2ecc71' : '#95a5a6'};
  margin-right: 8px;
`;

const GameCard = styled(Card)`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 1px solid #e0e0e0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
    background: linear-gradient(135deg, #ffffff 0%, #ecf0f1 100%);
  }

  h3 {
    color: #2c3e50;
    margin-bottom: 15px;
  }

  p {
    color: #7f8c8d;
    margin-bottom: 20px;
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 10px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;

  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
    margin-top: 10px;

    button {
      width: 100%;
    }
  }
`;

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
  const [activeTab, setActiveTab] = useState('friends');

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
    online: onlineUsers.includes(friend._id)
  })) || [];

  

  return (
    <Container>
      <Header>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Game Dashboard
        </motion.h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <StatusBadge online={isConnected}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </StatusBadge>
          <Button 
            danger
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Logout
          </Button>
        </div>
      </Header>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <h2>Welcome back, {user.username}!</h2>
          <p>Ready for your next game? Choose an option below to get started.</p>
          
          <SearchForm 
            onSubmit={handleSearch}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <SearchInput
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search players by username..."
              whileFocus={{ scale: 1.01 }}
            />
            <Button 
              type="submit" 
              primary
              disabled={searchLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {searchLoading ? 'Searching...' : 'Search'}
            </Button>
          </SearchForm>

          {searchError && <p style={{ color: '#e74c3c' }}>Error: {searchError}</p>}

          <AnimatePresence>
            {!searchLoading && searchResults?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                style={{ marginTop: '20px' }}
              >
                <h3>Search Results</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {searchResults.map(userResult => {
                    const isOnline = onlineUsers.includes(userResult._id);
                    const isFriend = (friends || []).some(f => f._id === userResult._id);
                    const requestSent = userResult.requestSent;

                    return (
                      <ListItem
                        key={userResult._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <UserInfo>
                          <Avatar>
                            {userResult.username.charAt(0).toUpperCase()}
                          </Avatar>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>{userResult.username}</div>
                            <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
                              <OnlineIndicator online={isOnline} />
                              {isOnline ? 'Online' : 'Offline'}
                            </div>
                          </div>
                        </UserInfo>
                        <ActionButtons>
                          {isFriend ? (
                            <Button disabled style={{ opacity: 0.7 }}>
                              Already friends
                            </Button>
                          ) : requestSent ? (
                            <Button success disabled>
                              Request sent
                            </Button>
                          ) : (
                            <Button 
                              primary
                              onClick={() => handleSendRequest(userResult._id)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Add Friend
                            </Button>
                          )}
                        </ActionButtons>
                      </ListItem>
                    );
                  })}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <Grid>
          <GameCard
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => alert("Coming soon: VS Computer Mode")}
          >
            <motion.div 
              whileHover={{ scale: 1.1 }}
              style={{ fontSize: '3rem', marginBottom: '20px' }}
            >
              🤖
            </motion.div>
            <h3>Play vs Computer</h3>
            <p>Challenge our AI opponent in an exciting match</p>
            <Button primary>Start Game</Button>
          </GameCard>

          <GameCard
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (friendsWithStatus.length === 0) {
                alert("You need to add friends first!");
              } else {
                alert("Select a friend from your friends list to play with");
              }
            }}
          >
            <motion.div 
              whileHover={{ scale: 1.1 }}
              style={{ fontSize: '3rem', marginBottom: '20px' }}
            >
              👥
            </motion.div>
            <h3>Play vs Friend</h3>
            <p>Invite a friend to a thrilling game session</p>
            <Button purple>Choose Friend</Button>
          </GameCard>
        </Grid>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          <Button 
            primary={activeTab === 'friends'}
            onClick={() => setActiveTab('friends')}
            style={{ flex: 1 }}
          >
            Friends ({friendsWithStatus.length})
          </Button>
          <Button 
            primary={activeTab === 'requests'}
            onClick={() => setActiveTab('requests')}
            style={{ flex: 1 }}
          >
            Requests ({incomingRequests?.length || 0})
          </Button>
        </div>

        {activeTab === 'friends' ? (
          <Card>
            <h2>Your Friends</h2>
            {friendsStatus === 'loading' ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{
                    width: '30px',
                    height: '30px',
                    border: '3px solid #3498db',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    display: 'inline-block'
                  }}
                />
              </div>
            ) : friendsWithStatus.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#7f8c8d' }}>
                No friends yet. Search for players to add friends!
              </p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <AnimatePresence>
                  {friendsWithStatus.map(friend => (
                    <ListItem
                      key={friend._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <UserInfo>
                        <Avatar style={{ backgroundColor: friend.online ? '#2ecc71' : '#95a5a6' }}>
                          {friend.username.charAt(0).toUpperCase()}
                        </Avatar>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{friend.username}</div>
                          <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
                            {friend.online ? 'Online now' : 'Last seen recently'}
                          </div>
                        </div>
                      </UserInfo>
                      <ActionButtons>
                        {friend.online && (
                          <Button 
                            purple
                            onClick={() => handleStartGameWithFriend(friend._id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Play Game
                          </Button>
                        )}
                      </ActionButtons>
                    </ListItem>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </Card>
        ) : (
          <Card>
            <h2>Friend Requests</h2>
            {requestStatus === 'loading' ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{
                    width: '30px',
                    height: '30px',
                    border: '3px solid #3498db',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    display: 'inline-block'
                  }}
                />
              </div>
            ) : !incomingRequests || incomingRequests.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#7f8c8d' }}>
                No pending friend requests
              </p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <AnimatePresence>
                  {Array.isArray(incomingRequests) &&
                    incomingRequests.map((req) => (
                      <ListItem
                        key={req._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <UserInfo>
                          <Avatar>
                            {req.username ? req.username.charAt(0).toUpperCase() : '?'}
                          </Avatar>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>
                              {req.username ? toTitleCase(req.username) : 'Unknown User'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
                              Sent you a friend request
                            </div>
                          </div>
                        </UserInfo>
                        <ActionButtons>
                          <Button 
                            success
                            onClick={() => handleRespondToRequest(req._id, 'accept')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Accept
                          </Button>
                          <Button 
                            danger
                            onClick={() => handleRespondToRequest(req._id, 'reject')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Reject
                          </Button>
                        </ActionButtons>
                      </ListItem>
                    ))
                  }
                </AnimatePresence>
              </ul>
            )}
          </Card>
        )}
      </motion.div>
    </Container>
  );
};

export default DashboardPage;