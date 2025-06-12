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
import styled, { keyframes, css } from 'styled-components';

// Styled Components
// const neonGlow = keyframes`
//   0%, 100% {
//     text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #0073e6, 0 0 20px #0073e6;
//   }
//   50% {
//     text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #0073e6, 0 0 40px #0073e6;
//   }
// `;

// const float = keyframes`
//   0% { transform: translateY(0px); }
//   50% { transform: translateY(-5px); }
//   100% { transform: translateY(0px); }
// `;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(74, 144, 226, 0.7); }
  70% { box-shadow: 0 0 0 15px rgba(74, 144, 226, 0); }
  100% { box-shadow: 0 0 0 0 rgba(74, 144, 226, 0); }
`;

const gradientBg = css`
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
`;

const DashboardContainer = styled.div`
  min-height: 100vh;
  ${gradientBg}
  color: #fff;
  font-family: 'Poppins', sans-serif;
  padding: 1rem;
  overflow-x: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjMDAwMDAwIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDVMNSAwWk02IDRMNCA2Wk0tMSAxTDEgLTFaIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSI+PC9wYXRoPgo8L3N2Zz4=');
    opacity: 0.3;
    z-index: 0;
  }

  @media (min-width: 768px) {
    padding: 1.5rem;
  }

  @media (min-width: 1024px) {
    padding: 2rem;
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1600px;
  margin: 0 auto;
`;

const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  position: relative;
  padding-bottom: 1.5rem;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, rgba(76,201,240,0.3) 0%, rgba(67,97,238,0.8) 50%, rgba(76,201,240,0.3) 100%);
  }

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const Title = styled.h1`
  font-size: 1.8rem;
  margin: 0;
  font-weight: 700;
  background: linear-gradient(90deg, #4cc9f0, #4361ee);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  display: inline-block;

  span {
    font-size: 1.2rem;
    display: block;
    font-weight: 400;
    color: rgba(255,255,255,0.8);
    text-transform: none;
    letter-spacing: normal;
    margin-top: 0.3rem;
  }

  @media (min-width: 768px) {
    font-size: 2.2rem;

    span {
      font-size: 1.4rem;
    }
  }
`;

const HeaderControls = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const StatusBadge = styled.div`
  padding: 0.5rem 1rem;
  background-color: ${props => props.connected ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)'};
  color: ${props => props.connected ? '#4ade80' : '#f87171'};
  border-radius: 50px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  border: 1px solid ${props => props.connected ? 'rgba(74, 222, 128, 0.5)' : 'rgba(248, 113, 113, 0.5)'};
  backdrop-filter: blur(5px);

  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${props => props.connected ? '#4ade80' : '#f87171'};
    margin-right: 0.3rem;
  }
`;

const LogoutButton = styled(motion.button)`
  padding: 0.5rem 1.5rem;
  background: rgba(248, 113, 113, 0.2);
  color: #f87171;
  border: 1px solid rgba(248, 113, 113, 0.5);
  border-radius: 50px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: rgba(248, 113, 113, 0.3);
    transform: translateY(-2px);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Section = styled(motion.section)`
  background: rgba(15, 23, 42, 0.7);
  border-radius: 16px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(76, 201, 240, 0.3);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  margin: 0 0 1.5rem 0;
  color: #fff;
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '';
    display: block;
    width: 4px;
    height: 1.2rem;
    background: linear-gradient(to bottom, #4cc9f0, #4361ee);
    border-radius: 2px;
  }

  span {
    font-size: 0.9rem;
    color: rgba(255,255,255,0.6);
    margin-left: auto;
  }

  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

const SearchForm = styled.form`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  width: 100%;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: rgba(76, 201, 240, 0.5);
    box-shadow: 0 0 0 3px rgba(76, 201, 240, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const Button = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  white-space: nowrap;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, #4361ee, #3a0ca3);
  color: white;
  box-shadow: 0 4px 15px rgba(67, 97, 238, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(67, 97, 238, 0.4);
  }
`;

const SecondaryButton = styled(Button)`
  background: linear-gradient(135deg, #4cc9f0, #4895ef);
  color: white;
  box-shadow: 0 4px 15px rgba(76, 201, 240, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(76, 201, 240, 0.4);
  }
`;

const DangerButton = styled(Button)`
  background: linear-gradient(135deg, #f87171, #ef4444);
  color: white;
  box-shadow: 0 4px 15px rgba(248, 113, 113, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(248, 113, 113, 0.4);
  }
`;

const SuccessButton = styled(Button)`
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  }
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ListItem = styled(motion.li)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(76, 201, 240, 0.2);
    transform: translateX(5px);
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4cc9f0, #4361ee);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  flex-shrink: 0;
`;

const Username = styled.span`
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const OnlineStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: ${props => props.online ? '#4ade80' : '#9ca3af'};
  flex-shrink: 0;

  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${props => props.online ? '#4ade80' : '#9ca3af'};
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-left: 0.5rem;
  flex-shrink: 0;
`;

const GameModesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const GameModeCard = styled(motion.div)`
  background: rgba(15, 23, 42, 0.7);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: rgba(76, 201, 240, 0.3);
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(to right, #4cc9f0, #4361ee);
  }
`;

const GameIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(76, 201, 240, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  font-size: 1.8rem;
  color: #4cc9f0;
  border: 2px solid rgba(76, 201, 240, 0.3);
`;

const GameTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  color: white;
`;

const GameDescription = styled.p`
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
`;

const PlayButton = styled(motion.button)`
  padding: 0.5rem 1.5rem;
  background: linear-gradient(135deg, #9d4edd, #7b2cbf);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: ${pulse} 2s infinite;
  box-shadow: 0 4px 15px rgba(157, 78, 221, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(157, 78, 221, 0.4);
    animation: none;
  }
`;

const EmptyState = styled.div`
  padding: 2rem 1rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 8px;
`;

const LoadingText = styled.div`
  padding: 1rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
`;

const Badge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 50px;
  font-size: 0.7rem;
  font-weight: 500;
  background: ${props => props.variant === 'success' ? 'rgba(16, 185, 129, 0.2)' : 
    props.variant === 'warning' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(156, 163, 175, 0.2)'};
  color: ${props => props.variant === 'success' ? '#10b981' : 
    props.variant === 'warning' ? '#eab308' : '#9ca3af'};
  border: 1px solid ${props => props.variant === 'success' ? 'rgba(16, 185, 129, 0.3)' : 
    props.variant === 'warning' ? 'rgba(234, 179, 8, 0.3)' : 'rgba(156, 163, 175, 0.3)'};
`;

const ChallengeButton = styled(Button)`
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #9d4edd, #7b2cbf);
  color: white;
  box-shadow: 0 4px 10px rgba(157, 78, 221, 0.3);
  font-size: 0.8rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(157, 78, 221, 0.4);
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
  
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <DashboardContainer>
      <ContentWrapper>
        <Header>
          <Title>
            GAME DASHBOARD
            <span>Welcome back, {user.username}</span>
          </Title>
          <HeaderControls>
            <StatusBadge connected={isConnected}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </StatusBadge>
            <LogoutButton 
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </LogoutButton>
          </HeaderControls>
        </Header>

        <MainGrid>
          {/* Left Column */}
          <div>
            {/* Search Section */}
            <Section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <SectionTitle>
                Find Players
                {searchResults?.length > 0 && <span>{searchResults.length} found</span>}
              </SectionTitle>
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

              {searchError && <p style={{ color: '#f87171', fontSize: '0.9rem', marginTop: '0.5rem' }}>Error: {searchError}</p>}

              <AnimatePresence>
                {!searchLoading && searchResults?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <List>
                      {searchResults.map(userResult => {
                        const isOnline = onlineUsers.includes(userResult._id);
                        const isFriend = (friends || []).some(f => f._id === userResult._id);
                        const requestSent = userResult.requestSent;

                        return (
                          <ListItem
                            key={userResult._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <UserInfo>
                              <Avatar>{getInitials(userResult.username)}</Avatar>
                              <Username>{userResult.username}</Username>
                              <OnlineStatus online={isOnline}>
                                {isOnline ? 'Online' : 'Offline'}
                              </OnlineStatus>
                            </UserInfo>
                            <Actions>
                              {isFriend ? (
                                <Badge variant="success">Friends</Badge>
                              ) : requestSent ? (
                                <Badge variant="warning">Request Sent</Badge>
                              ) : (
                                <SecondaryButton
                                  onClick={() => handleSendRequest(userResult._id)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  Add
                                </SecondaryButton>
                              )}
                            </Actions>
                          </ListItem>
                        );
                      })}
                    </List>
                  </motion.div>
                )}
              </AnimatePresence>

              {!searchLoading && searchResults?.length === 0 && searchQuery && (
                <EmptyState>No players found matching "{searchQuery}"</EmptyState>
              )}
            </Section>

            {/* Friends Section */}
            <Section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <SectionTitle>
                Your Friends
                <span>{friendsWithStatus.length} total</span>
              </SectionTitle>
              {friendsStatus === 'loading' ? (
                <LoadingText>Loading friends...</LoadingText>
              ) : friendsWithStatus.length === 0 ? (
                <EmptyState>No friends yet. Search for players to add friends!</EmptyState>
              ) : (
                <List>
                  <AnimatePresence>
                    {friendsWithStatus.map(friend => (
                      <ListItem
                        key={friend._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <UserInfo>
                          <Avatar>{getInitials(friend.username)}</Avatar>
                          <Username>{friend.username}</Username>
                          <OnlineStatus online={friend.online}>
                            {friend.online ? 'Online' : 'Offline'}
                          </OnlineStatus>
                        </UserInfo>
                        <Actions>
                          {friend.online && (
                            <ChallengeButton
                              onClick={() => handleStartGameWithFriend(friend._id)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Challenge
                            </ChallengeButton>
                          )}
                        </Actions>
                      </ListItem>
                    ))}
                  </AnimatePresence>
                </List>
              )}
            </Section>
          </div>

          {/* Right Column */}
          <div>
            {/* Game Modes Section */}
            <Section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <SectionTitle>Game Modes</SectionTitle>
              <GameModesGrid>
                <GameModeCard
                  onClick={() => alert("Coming soon: VS Computer Mode")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <GameIcon>🤖</GameIcon>
                  <GameTitle>VS Computer</GameTitle>
                  <GameDescription>Practice against AI opponent with adjustable difficulty</GameDescription>
                  <PlayButton
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Play Now
                  </PlayButton>
                </GameModeCard>

                <GameModeCard
                  onClick={() => {
                    if (friendsWithStatus.length === 0) {
                      alert("You need to add friends first!");
                    } else {
                      alert("Select a friend from your friends list to play with");
                    }
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <GameIcon>👥</GameIcon>
                  <GameTitle>VS Friend</GameTitle>
                  <GameDescription>Challenge your friends to a real-time match</GameDescription>
                  <PlayButton
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Select Friend
                  </PlayButton>
                </GameModeCard>
              </GameModesGrid>
            </Section>

            {/* Friend Requests Section */}
            <Section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <SectionTitle>
                Friend Requests
                {incomingRequests?.length > 0 && <span>{incomingRequests.length} pending</span>}
              </SectionTitle>
              {requestStatus === 'loading' ? (
                <LoadingText>Loading requests...</LoadingText>
              ) : !incomingRequests || incomingRequests.length === 0 ? (
                <EmptyState>No new friend requests</EmptyState>
              ) : (
                <List>
                  <AnimatePresence>
                    {Array.isArray(incomingRequests) &&
                      incomingRequests.map((req) => (
                        <ListItem
                          key={req._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <UserInfo>
                            <Avatar>{getInitials(req.username)}</Avatar>
                            <Username>{req.username ? toTitleCase(req.username) : 'Unknown User'}</Username>
                            <Badge>Request</Badge>
                          </UserInfo>
                          <Actions>
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
                          </Actions>
                        </ListItem>
                      ))
                    }
                  </AnimatePresence>
                </List>
              )}
            </Section>
          </div>
        </MainGrid>
      </ContentWrapper>
    </DashboardContainer>
  );
};

export default DashboardPage;