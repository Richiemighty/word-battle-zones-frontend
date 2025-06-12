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

// Game-themed colors
const colors = {
  primary: '#6c5ce7',
  secondary: '#a29bfe',
  accent: '#fd79a8',
  dark: '#2d3436',
  darker: '#1e272e',
  light: '#dfe6e9',
  success: '#00b894',
  danger: '#d63031',
  warning: '#fdcb6e',
  info: '#0984e3'
};

// Animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(108, 92, 231, 0.7); }
  70% { box-shadow: 0 0 0 12px rgba(108, 92, 231, 0); }
  100% { box-shadow: 0 0 0 0 rgba(108, 92, 231, 0); }
`;

const gradientBackground = css`
  background: linear-gradient(135deg, ${colors.darker} 0%, ${colors.dark} 100%);
`;

// Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  ${gradientBackground};
  color: ${colors.light};
  font-family: 'Poppins', sans-serif;
  padding: 1rem;
  position: relative;
  overflow-x: hidden;

  @media (min-width: 768px) {
    padding: 1.5rem;
  }

  @media (min-width: 1024px) {
    padding: 2rem;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 300px;
    background: linear-gradient(135deg, rgba(108, 92, 231, 0.2) 0%, rgba(253, 121, 168, 0.1) 100%);
    z-index: 0;
    pointer-events: none;
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
  position: relative;
  z-index: 1;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  margin: 0;
  font-weight: 700;
  background: linear-gradient(90deg, ${colors.secondary}, ${colors.primary});
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  position: relative;
  display: inline-block;

  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, ${colors.secondary}, ${colors.primary});
    border-radius: 3px;
  }

  @media (min-width: 768px) {
    font-size: 2.2rem;
  }
`;

const UserBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${colors.primary}, ${colors.accent});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const StatusBadge = styled.div`
  padding: 0.5rem 1rem;
  background-color: ${props => props.connected ? colors.success : colors.danger};
  color: white;
  border-radius: 20px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &::before {
    content: '';
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${props => props.connected ? '#fff' : '#fff'};
    animation: ${props => props.connected ? css`${pulse} 2s infinite` : 'none'};
  }
`;

const LogoutButton = styled.button`
  padding: 0.5rem 1.5rem;
  background: linear-gradient(135deg, ${colors.danger}, #c0392b);
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }

  &::before {
    content: '🚪';
  }
`;

const Section = styled(motion.section)`
  background: rgba(30, 39, 46, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.4rem;
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: ${colors.light};
  position: relative;
  padding-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 50px;
    height: 3px;
    background: linear-gradient(90deg, ${colors.primary}, ${colors.accent});
    border-radius: 3px;
  }

  &::before {
    content: '${props => props.icon || '🎮'}';
    font-size: 1.2rem;
  }
`;

const SearchForm = styled.form`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: ${colors.light};
  font-size: 1rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.2);
    box-shadow: 0 0 0 2px ${colors.primary};
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const Button = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);

    &::after {
      opacity: 1;
    }
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, ${colors.primary}, #5a4fcf);
`;

const SecondaryButton = styled(Button)`
  background: linear-gradient(135deg, ${colors.secondary}, #8c7ae6);
`;

const DangerButton = styled(Button)`
  background: linear-gradient(135deg, ${colors.danger}, #c0392b);
`;

const SuccessButton = styled(Button)`
  background: linear-gradient(135deg, ${colors.success}, #00a884);
`;

const FriendList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.75rem;
`;

const FriendItem = styled(motion.li)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(5px);
    border-color: rgba(255, 255, 255, 0.1);
  }
`;

const FriendInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

// const OnlineStatus = styled.span`
//   display: inline-block;
//   width: 12px;
//   height: 12px;
//   border-radius: 50%;
//   background-color: ${props => props.online ? colors.success : '#7f8c8d'};
//   box-shadow: 0 0 8px ${props => props.online ? colors.success : 'transparent'};
//   position: relative;

//   &::after {
//     content: '';
//     position: absolute;
//     top: -3px;
//     left: -3px;
//     right: -3px;
//     bottom: -3px;
//     border-radius: 50%;
//     border: 1px solid ${props => props.online ? colors.success : 'transparent'};
//     animation: ${props => props.online ? css`${pulse} 2s infinite` : 'none'};
//   }
// `;

const GameOptionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const GameOptionCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.1);
  }

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      to bottom right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.05) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    transform: rotate(30deg);
    transition: all 0.5s ease;
    opacity: 0;
  }

  &:hover::before {
    animation: shine 1.5s infinite;
    opacity: 1;
  }

  @keyframes shine {
    0% {
      transform: translateX(-100%) rotate(30deg);
    }
    100% {
      transform: translateX(100%) rotate(30deg);
    }
  }
`;

const GameOptionIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, ${colors.primary}, ${colors.accent});
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: ${float} 3s ease-in-out infinite;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1rem;
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.02);
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 1.5rem;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1rem;
`;

const ResponsiveGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const PlayButton = styled(motion.button)`
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, ${colors.accent}, #e84393);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: ${pulse} 2s infinite;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }

  &::before {
    content: '🎯';
  }
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${colors.primary}, ${colors.accent});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1rem;
`;

const Badge = styled.span`
  padding: 0.25rem 0.5rem;
  background: ${props => props.variant === 'online' ? colors.success : colors.warning};
  color: white;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 500;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  background: linear-gradient(90deg, ${colors.secondary}, ${colors.primary});
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
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

  const onlineFriendsCount = friendsWithStatus.filter(f => f.online).length;
  const pendingRequestsCount = incomingRequests?.length || 0;

  return (
    <DashboardContainer>
      <Header>
        <Title>Game Dashboard</Title>
        <UserBadge>
          <Avatar>{user.username.charAt(0).toUpperCase()}</Avatar>
          <StatusBadge connected={isConnected}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </StatusBadge>
          <LogoutButton onClick={handleLogout}>
            Logout
          </LogoutButton>
        </UserBadge>
      </Header>

      {/* Quick Stats */}
      <StatsContainer>
        <StatCard>
          <StatValue>{friendsWithStatus.length}</StatValue>
          <StatLabel>Total Friends</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{onlineFriendsCount}</StatValue>
          <StatLabel>Online Now</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{pendingRequestsCount}</StatValue>
          <StatLabel>Pending Requests</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>0</StatValue>
          <StatLabel>Active Games</StatLabel>
        </StatCard>
      </StatsContainer>

      {/* Main Content Grid */}
      <ResponsiveGrid>
        {/* Friends Section */}
        <Section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <SectionTitle icon="👥">Your Friends</SectionTitle>
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
                      <UserAvatar>{friend.username.charAt(0).toUpperCase()}</UserAvatar>
                      <div>
                        <div style={{ fontWeight: '500' }}>{friend.username}</div>
                        {friend.online ? (
                          <Badge variant="online">Online</Badge>
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>Last seen: recently</span>
                        )}
                      </div>
                    </FriendInfo>
                    <div>
                      {friend.online && (
                        <PlayButton
                          onClick={() => handleStartGameWithFriend(friend._id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          Play
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
          <SectionTitle icon="🎮">Game Modes</SectionTitle>
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

      {/* Search Section */}
      <Section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SectionTitle icon="🔍">Find Players</SectionTitle>
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

        {searchError && <p style={{ color: colors.danger }}>Error: {searchError}</p>}

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
                        <UserAvatar>{userResult.username.charAt(0).toUpperCase()}</UserAvatar>
                        <div>
                          <div style={{ fontWeight: '500' }}>{userResult.username}</div>
                          {isOnline ? (
                            <Badge variant="online">Online</Badge>
                          ) : (
                            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>Offline</span>
                          )}
                        </div>
                      </FriendInfo>
                      <div>
                        {isFriend ? (
                          <span style={{ color: colors.secondary }}>Friends</span>
                        ) : requestSent ? (
                          <span style={{ color: colors.warning }}>Request Sent</span>
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

      {/* Friend Requests Section */}
      <Section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <SectionTitle icon="📩">Friend Requests</SectionTitle>
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
                    <FriendInfo>
                      <UserAvatar>{req.username?.charAt(0).toUpperCase() || '?'}</UserAvatar>
                      <span>
                        <strong>{req.username ? toTitleCase(req.username) : 'Unknown User'}</strong> wants to be your friend
                      </span>
                    </FriendInfo>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
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