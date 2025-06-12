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

// Styled Components
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(74, 144, 226, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(74, 144, 226, 0); }
  100% { box-shadow: 0 0 0 0 rgba(74, 144, 226, 0); }
`;

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
  font-family: 'Poppins', sans-serif;
  padding: 20px;
  animation: ${fadeIn} 0.5s ease-out;

  @media (min-width: 768px) {
    padding: 30px;
  }

  @media (min-width: 1024px) {
    padding: 40px;
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  background: linear-gradient(90deg, #4cc9f0, #4361ee);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 0;
  font-weight: 700;

  @media (min-width: 768px) {
    font-size: 2.2rem;
  }
`;

const StatusBadge = styled.div`
  padding: 8px 15px;
  background-color: ${props => props.connected ? '#4ade80' : '#f87171'};
  color: white;
  border-radius: 20px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const LogoutButton = styled.button`
  padding: 8px 20px;
  background: linear-gradient(135deg, #f87171, #ef4444);
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }
`;

const Section = styled(motion.section)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 1.4rem;
  margin-top: 0;
  margin-bottom: 20px;
  color: #fff;
  position: relative;
  padding-bottom: 10px;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 50px;
    height: 3px;
    background: linear-gradient(90deg, #4cc9f0, #4361ee);
    border-radius: 3px;
  }
`;

const SearchForm = styled.form`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
  padding: 12px 15px;
  border-radius: 10px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.2);
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.5);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
`;

const PrimaryButton = styled(motion.button)`
  padding: 12px 20px;
  background: linear-gradient(135deg, #4361ee, #3a0ca3);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    background: #6b7280;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const SecondaryButton = styled(PrimaryButton)`
  background: linear-gradient(135deg, #4cc9f0, #4895ef);
`;

const DangerButton = styled(PrimaryButton)`
  background: linear-gradient(135deg, #f87171, #ef4444);
`;

const SuccessButton = styled(PrimaryButton)`
  background: linear-gradient(135deg, #10b981, #059669);
`;

const FriendList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FriendItem = styled(motion.li)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  margin-bottom: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(5px);
  }
`;

const FriendInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const OnlineStatus = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.online ? '#4ade80' : '#9ca3af'};
`;

const GameOptionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const GameOptionCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
`;

const GameOptionIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 15px;
  background: linear-gradient(135deg, #4cc9f0, #4361ee);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 30px;
  color: rgba(255, 255, 255, 0.7);
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.7);
`;

const ResponsiveGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const PlayButton = styled(motion.button)`
  padding: 8px 15px;
  background: linear-gradient(135deg, #9d4edd, #7b2cbf);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: ${pulse} 2s infinite;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
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
    <DashboardContainer>
      <Header>
        <Title>Welcome, {user.username}!</Title>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <StatusBadge connected={isConnected}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </StatusBadge>
          <LogoutButton onClick={handleLogout}>
            Logout
          </LogoutButton>
        </div>
      </Header>

      {/* Search Section */}
      <Section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SectionTitle>Find Players</SectionTitle>
        <SearchForm onSubmit={handleSearch}>
          <SearchInput
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username..."
          />
          <PrimaryButton
            type="submit"
            disabled={searchLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {searchLoading ? 'Searching...' : 'Search'}
          </PrimaryButton>
        </SearchForm>

        {searchError && <p style={{ color: '#f87171' }}>Error: {searchError}</p>}

        <AnimatePresence>
          {!searchLoading && searchResults?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FriendList>
                {searchResults.map(userResult => {
                  const isOnline = onlineUsers.includes(userResult._id);
                  const isFriend = (friends || []).some(f => f._id === userResult._id);
                  const requestSent = userResult.requestSent;

                  return (
                    <FriendItem
                      key={userResult._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FriendInfo>
                        <span style={{ fontWeight: 'bold' }}>{userResult.username}</span>
                        <OnlineStatus online={isOnline} />
                        {isOnline && <span style={{ fontSize: '0.8rem', color: '#4ade80' }}>Online</span>}
                      </FriendInfo>
                      <div>
                        {isFriend ? (
                          <span style={{ color: '#9ca3af' }}>Already friends</span>
                        ) : requestSent ? (
                          <span style={{ color: '#4ade80' }}>Request sent</span>
                        ) : (
                          <SecondaryButton
                            onClick={() => handleSendRequest(userResult._id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Add Friend
                          </SecondaryButton>
                        )}
                      </div>
                    </FriendItem>
                  );
                })}
              </FriendList>
            </motion.div>
          )}
        </AnimatePresence>

        {!searchLoading && searchResults?.length === 0 && searchQuery && (
          <EmptyState>No players found matching "{searchQuery}"</EmptyState>
        )}
      </Section>

      {/* Main Content Grid */}
      <ResponsiveGrid>
        {/* Friends Section */}
        <Section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <SectionTitle>Your Friends ({friendsWithStatus.length})</SectionTitle>
          {friendsStatus === 'loading' ? (
            <LoadingText>Loading friends...</LoadingText>
          ) : friendsWithStatus.length === 0 ? (
            <EmptyState>No friends yet. Search for players to add friends!</EmptyState>
          ) : (
            <FriendList>
              <AnimatePresence>
                {friendsWithStatus.map(friend => (
                  <FriendItem
                    key={friend._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FriendInfo>
                      <span>{friend.username}</span>
                      <OnlineStatus online={friend.online} />
                      {friend.online && <span style={{ fontSize: '0.8rem', color: '#4ade80' }}>Online</span>}
                    </FriendInfo>
                    <div>
                      {friend.online && (
                        <PlayButton
                          onClick={() => handleStartGameWithFriend(friend._id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          Challenge
                        </PlayButton>
                      )}
                    </div>
                  </FriendItem>
                ))}
              </AnimatePresence>
            </FriendList>
          )}
        </Section>

        {/* Game Options Section */}
        <Section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <SectionTitle>Game Modes</SectionTitle>
          <GameOptionsGrid>
            <GameOptionCard
              onClick={() => alert("Coming soon: VS Computer Mode")}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <GameOptionIcon>🤖</GameOptionIcon>
              <h3>VS Computer</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                Practice against AI opponent
              </p>
              <PrimaryButton
                style={{ marginTop: '15px' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Play Now
              </PrimaryButton>
            </GameOptionCard>

            <GameOptionCard
              onClick={() => {
                if (friendsWithStatus.length === 0) {
                  alert("You need to add friends first!");
                } else {
                  alert("Select a friend from your friends list to play with");
                }
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <GameOptionIcon>👥</GameOptionIcon>
              <h3>VS Friend</h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                Challenge your friends online
              </p>
              <PrimaryButton
                style={{ marginTop: '15px' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Select Friend
              </PrimaryButton>
            </GameOptionCard>
          </GameOptionsGrid>
        </Section>
      </ResponsiveGrid>

      {/* Friend Requests Section */}
      <Section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <SectionTitle>Friend Requests</SectionTitle>
        {requestStatus === 'loading' ? (
          <LoadingText>Loading requests...</LoadingText>
        ) : !incomingRequests || incomingRequests.length === 0 ? (
          <EmptyState>No new friend requests</EmptyState>
        ) : (
          <FriendList>
            <AnimatePresence>
              {Array.isArray(incomingRequests) &&
                incomingRequests.map((req) => (
                  <FriendItem
                    key={req._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span>
                      <strong>{req.username ? toTitleCase(req.username) : 'Unknown User'}</strong> wants to be your friend
                    </span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <SuccessButton
                        onClick={() => handleRespondToRequest(req._id, 'accept')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Accept
                      </SuccessButton>
                      <DangerButton
                        onClick={() => handleRespondToRequest(req._id, 'reject')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Reject
                      </DangerButton>
                    </div>
                  </FriendItem>
                ))
              }
            </AnimatePresence>
          </FriendList>
        )}
      </Section>
    </DashboardContainer>
  );
};

export default DashboardPage;