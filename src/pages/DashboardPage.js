import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchFriends } from '../features/friends/friendsSlice';
import { searchUsers, sendFriendRequest, clearSearchResults } from '../features/search/searchSlice';
import { initializeSocket } from '../services/socketManager';
import { fetchFriendRequests } from '../features/friendRequests/friendRequestsSlice';
import { respondToFriendRequest } from '../features/friends/friendRequestsSlice';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';
import { FaGamepad, FaUserFriends, FaSearch, FaSignOutAlt, FaUserPlus, FaCheck, FaTimes, FaRobot, FaUser } from 'react-icons/fa';
import { GiTrophy } from 'react-icons/gi';
import { motion } from 'framer-motion';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled Components
const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.5s ease-out;

  h1 {
    color: #2c3e50;
    font-size: 2rem;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;

    @media (max-width: 768px) {
      font-size: 1.5rem;
    }
  }
`;

const StatusBadge = styled.div`
  padding: 8px 15px;
  background-color: ${props => props.connected ? '#2ecc71' : '#e74c3c'};
  color: white;
  border-radius: 20px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const LogoutButton = styled.button`
  padding: 8px 15px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #c0392b;
    transform: translateY(-2px);
  }
`;

const SearchSection = styled.section`
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  animation: ${fadeIn} 0.6s ease-out;

  h2 {
    color: #3498db;
    margin-top: 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

const SearchForm = styled.form`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 30px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    border-color: #3498db;
    outline: none;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  }
`;

const SearchButton = styled.button`
  padding: 12px 20px;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(52, 152, 219, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
  }

  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const SearchResults = styled.div`
  margin-top: 20px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const UserCard = styled.div`
  padding: 15px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;

  &:hover {
    background: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  span {
    font-weight: 600;
  }
`;

const OnlineStatus = styled.span`
  font-size: 0.8rem;
  color: ${props => props.online ? '#2ecc71' : '#95a5a6'};
  display: flex;
  align-items: center;
  gap: 5px;

  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${props => props.online ? '#2ecc71' : '#95a5a6'};
  }
`;

const ActionButton = styled.button`
  padding: 8px 15px;
  background: ${props => 
    props.variant === 'primary' ? 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)' :
    props.variant === 'secondary' ? 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)' :
    props.variant === 'danger' ? 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)' :
    'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)'};
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  animation: ${fadeIn} 0.7s ease-out;
`;

const SectionTitle = styled.h2`
  color: ${props => props.color || '#2c3e50'};
  margin-top: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
`;

const FriendList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FriendItem = styled.li`
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;

  &:hover {
    background: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const GameOptions = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
`;

const GameOptionCard = styled(motion.div)`
  background: ${props => 
    props.variant === 'ai' ? 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)' :
    'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'};
  color: white;
  padding: 20px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  h3 {
    margin: 10px 0 5px;
    font-size: 1.2rem;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.9;
  }
`;

const IconWrapper = styled.div`
  font-size: 2rem;
  margin-bottom: 10px;
`;

const RequestsSection = styled(Section)`
  grid-column: 1 / -1;
`;

const RequestItem = styled.div`
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 30px;
  color: #7f8c8d;

  p {
    margin: 0;
  }
`;

const TrophyIcon = styled(GiTrophy)`
  color: #f39c12;
  font-size: 1.5rem;
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
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <FaGamepad /> Game Dashboard
        </motion.h1>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <StatusBadge connected={isConnected}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </StatusBadge>
          <LogoutButton onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </LogoutButton>
        </div>
      </Header>

      <SearchSection>
        <h2><FaSearch /> Find Players</h2>
        <SearchForm onSubmit={handleSearch}>
          <SearchInput
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username..."
          />
          <SearchButton type="submit" disabled={searchLoading}>
            {searchLoading ? 'Searching...' : 'Search'}
          </SearchButton>
        </SearchForm>

        {searchError && <p style={{ color: '#e74c3c' }}>Error: {searchError}</p>}

        {!searchLoading && searchResults?.length > 0 && (
          <SearchResults>
            {searchResults.map(userResult => {
              const isOnline = onlineUsers.includes(userResult._id);
              const isFriend = (friends || []).some(f => f._id === userResult._id);
              const requestSent = userResult.requestSent;

              return (
                <UserCard key={userResult._id}>
                  <UserInfo>
                    <span>{userResult.username}</span>
                    <OnlineStatus online={isOnline}>
                      {isOnline ? 'Online' : 'Offline'}
                    </OnlineStatus>
                  </UserInfo>
                  <div>
                    {isFriend ? (
                      <ActionButton variant="secondary" disabled>
                        <FaUserFriends /> Friends
                      </ActionButton>
                    ) : requestSent ? (
                      <ActionButton variant="secondary" disabled>
                        <FaCheck /> Request Sent
                      </ActionButton>
                    ) : (
                      <ActionButton 
                        variant="primary" 
                        onClick={() => handleSendRequest(userResult._id)}
                      >
                        <FaUserPlus /> Add Friend
                      </ActionButton>
                    )}
                  </div>
                </UserCard>
              );
            })}
          </SearchResults>
        )}

        {!searchLoading && searchResults?.length === 0 && searchQuery && (
          <EmptyState>
            <p>No players found matching "{searchQuery}"</p>
          </EmptyState>
        )}
      </SearchSection>

      <MainContent>
        <Section>
          <SectionTitle color="#8e44ad">
            <FaUserFriends /> Your Friends ({friendsWithStatus.length})
          </SectionTitle>
          {friendsStatus === 'loading' ? (
            <EmptyState>
              <p>Loading friends...</p>
            </EmptyState>
          ) : friendsWithStatus.length === 0 ? (
            <EmptyState>
              <p>No friends yet. Search for players to add friends!</p>
            </EmptyState>
          ) : (
            <FriendList>
              {friendsWithStatus.map(friend => (
                <FriendItem key={friend._id}>
                  <UserInfo>
                    <span>{friend.username}</span>
                    <OnlineStatus online={friend.online}>
                      {friend.online ? 'Online' : 'Offline'}
                    </OnlineStatus>
                  </UserInfo>
                  <div>
                    {friend.online ? (
                      <ActionButton 
                        variant="purple" 
                        onClick={() => handleStartGameWithFriend(friend._id)}
                      >
                        <FaGamepad /> Play
                      </ActionButton>
                    ) : (
                      <ActionButton variant="secondary" disabled>
                        <FaGamepad /> Play
                      </ActionButton>
                    )}
                  </div>
                </FriendItem>
              ))}
            </FriendList>
          )}
        </Section>

        <Section>
          <SectionTitle color="#3498db">
            <FaGamepad /> Game Options
          </SectionTitle>
          <GameOptions>
            <GameOptionCard 
              variant="ai"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => alert("Coming soon: VS Computer Mode")}
            >
              <IconWrapper>
                <FaRobot />
              </IconWrapper>
              <h3>Play vs Computer</h3>
              <p>Challenge our AI opponent</p>
            </GameOptionCard>
            
            <GameOptionCard 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (friendsWithStatus.length === 0) {
                  alert("You need to add friends first!");
                } else {
                  alert("Select a friend from your friends list to play with");
                }
              }}
            >
              <IconWrapper>
                <FaUser />
              </IconWrapper>
              <h3>Play vs Friend</h3>
              <p>Challenge your friends</p>
            </GameOptionCard>
          </GameOptions>
        </Section>
      </MainContent>

      <RequestsSection>
        <SectionTitle color="#e74c3c">
          <FaUserPlus /> Friend Requests
        </SectionTitle>
        {requestStatus === 'loading' ? (
          <EmptyState>
            <p>Loading requests...</p>
          </EmptyState>
        ) : !incomingRequests || incomingRequests.length === 0 ? (
          <EmptyState>
            <p>No new friend requests.</p>
          </EmptyState>
        ) : (
          <div>
            {Array.isArray(incomingRequests) &&
              incomingRequests.map((req) => (
                <RequestItem key={req._id}>
                  <span>
                    <strong>{req.username ? toTitleCase(req.username) : 'Unknown User'}</strong> wants to be your friend
                  </span>
                  <ButtonGroup>
                    <ActionButton 
                      variant="primary" 
                      onClick={() => handleRespondToRequest(req._id, 'accept')}
                    >
                      <FaCheck /> Accept
                    </ActionButton>
                    <ActionButton 
                      variant="danger" 
                      onClick={() => handleRespondToRequest(req._id, 'reject')}
                    >
                      <FaTimes /> Reject
                    </ActionButton>
                  </ButtonGroup>
                </RequestItem>
              ))
            }
          </div>
        )}
      </RequestsSection>
    </DashboardContainer>
  );
};

export default DashboardPage;