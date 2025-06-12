// src/pages/DashboardPage.js
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchFriends } from '../features/friends/friendsSlice';
import { searchUsers, sendFriendRequest, clearSearchResults } from '../features/search/searchSlice';
import { initializeSocket } from '../services/socketManager';
import { fetchFriendRequests } from '../features/friendRequests/friendRequestsSlice';
import { respondToFriendRequest } from '../features/friends/friendRequestsSlice';
import axios from 'axios';
import { motion } from 'framer-motion';
import styled, { keyframes, css } from 'styled-components';

// Animations and shared styles
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(157,78,221,0.7); }
  70% { box-shadow: 0 0 0 15px rgba(157,78,221,0); }
  100% { box-shadow: 0 0 0 0 rgba(157,78,221,0); }
`;
const gradientBg = css`
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
`;
const DashboardContainer = styled.div`
  min-height: 100vh; ${gradientBg}
  color: #fff; font-family: 'Poppins', sans-serif; padding: 1rem; position: relative;
  &::before { /* subtle pattern */ }
  @media (min-width: 768px){ padding:1.5rem; }
  @media (min-width: 1024px){ padding:2rem; }
`;
const ContentWrapper = styled.div`
  position: relative; z-index:1; max-width:1600px; margin:0 auto;
`;
const Header = styled.header`
  display:flex; flex-direction:column; gap:1rem; margin-bottom:2rem; position:relative;
  &::after{ content:''; position:absolute; bottom:0;left:0;width:100%;height:1px; background:linear-gradient(90deg,rgba(76,201,240,0.3),rgba(67,97,238,0.8),rgba(76,201,240,0.3)); }
  @media (min-width:768px){ flex-direction:row; justify-content:space-between; align-items:center; }
`;
const Title = styled.h1`
  font-size:1.8rem;margin:0;font-weight:700;
  background:linear-gradient(90deg,#4cc9f0,#4361ee);
  -webkit-background-clip:text;background-clip:text;color:transparent;
  text-transform:uppercase;letter-spacing:1px;
  span{ font-size:1.2rem; display:block; font-weight:400; color:rgba(255,255,255,0.8); margin-top:0.3rem; }
  @media(min-width:768px){ font-size:2.2rem; span{font-size:1.4rem;} }
`;
const HeaderControls = styled.div`
  display:flex; gap:1rem; align-items:center;
`;
const StatusBadge = styled.div`
  padding:.5rem 1rem; border-radius:50px; font-size:.9rem; display:flex; align-items:center; gap:.5rem;
  background-color:${p => p.connected ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'};
  color:${p => p.connected ? '#4ade80' : '#f87171'};
  border:1px solid ${p => p.connected ? 'rgba(74,222,128,0.5)' : 'rgba(248,113,113,0.5)'};
  &::before{ content:''; width:8px; height:8px; border-radius:50%; background-color:${p => p.connected ? '#4ade80' : '#f87171'}; margin-right:.3rem;}
`;
const LogoutButton = styled(motion.button)`
  padding:.5rem 1.5rem; border-radius:50px; cursor:pointer; font-weight:500;
  background:rgba(248,113,113,0.2); color:#f87171; border:1px solid rgba(248,113,113,0.5);
  backdrop-filter:blur(5px);
  &:hover { background:rgba(248,113,113,0.3); transform:translateY(-2px); }
`;
const MainGrid = styled.div`
  display:grid; grid-template-columns:1fr; gap:1.5rem;
  @media(min-width:1024px){ grid-template-columns:1fr 1fr; }
`;
const Section = styled(motion.section)`
  background:rgba(15,23,42,0.7); border-radius:16px; padding:1.5rem; backdrop-filter:blur(10px);
  border:1px solid rgba(255,255,255,0.1); box-shadow:0 8px 32px rgba(0,0,0,0.1);
  &:hover{ border-color:rgba(76,201,240,0.3); box-shadow:0 10px 40px rgba(0,0,0,0.2); }
`;
const SectionTitle = styled.h2`
  font-size:1.3rem;margin-bottom:1rem;color:#fff;display:flex;align-items:center;gap:.5rem;
  &::before{content:'';width:4px;height:1.2rem;background:linear-gradient(to bottom,#4cc9f0,#4361ee);border-radius:2px;}
  span{ margin-left:auto;color:rgba(255,255,255,0.6); font-size:.9rem; }
  @media(min-width:768px){ font-size:1.5rem; }
`;
const SearchForm = styled.form`
  display:flex;gap:.75rem;margin-bottom:1rem;width:100%;
`;
const SearchInput = styled.input`
  flex:1; padding:.75rem 1rem; border-radius:8px; font-size:1rem;
  border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.05); color:#fff;
  &:focus{ outline:none; border-color:rgba(76,201,240,0.5); box-shadow:0 0 0 3px rgba(76,201,240,0.1); }
  &::placeholder{ color:rgba(255,255,255,0.4); }
`;
const ButtonBase = styled(motion.button)`
  padding:.75rem 1.5rem; border:none; border-radius:8px; cursor:pointer;
  font-weight:500; font-size:.9rem; display:flex; align-items:center; gap:.5rem;
  transition:all .3s ease;
  &:disabled{ opacity:.6; cursor:not-allowed; transform:none!important; }
`;
const PrimaryButton = styled(ButtonBase)`
  background:linear-gradient(135deg,#4361ee,#3a0ca3); color:#fff;
  box-shadow:0 4px 15px rgba(67,97,238,0.3);
  &:hover{ transform:translateY(-2px); box-shadow:0 6px 20px rgba(67,97,238,0.4); }
`;
const SecondaryButton = styled(ButtonBase)`
  background:linear-gradient(135deg,#4cc9f0,#4895ef); color:#fff;
  box-shadow:0 4px 15px rgba(76,201,240,0.3);
  &:hover{ transform:translateY(-2px); box-shadow:0 6px 20px rgba(76,201,240,0.4); }
`;
const DangerButton = styled(ButtonBase)`
  background:linear-gradient(135deg,#f87171,#ef4444); color:#fff;
  box-shadow:0 4px 15px rgba(248,113,113,0.3);
  &:hover{ transform:translateY(-2px); box-shadow:0 6px 20px rgba(248,113,113,0.4); }
`;
const SuccessButton = styled(ButtonBase)`
  background:linear-gradient(135deg,#10b981,#059669); color:#fff;
  box-shadow:0 4px 15px rgba(16,185,129,0.3);
  &:hover{ transform:translateY(-2px); box-shadow:0 6px 20px rgba(16,185,129,0.4); }
`;
const List = styled.ul`
  list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:.75rem;
`;
const ListItem = styled(motion.li)`
  background:rgba(255,255,255,0.05); border-radius:8px; padding:1rem;
  border:1px solid rgba(255,255,255,0.05); display:flex; align-items:center;
  justify-content:space-between;
  &:hover{ background:rgba(255,255,255,0.08); border-color:rgba(76,201,240,0.2); transform:translateX(5px); }
`;
const UserInfo = styled.div`
  display:flex; align-items:center; gap:.75rem; flex:1; min-width:0;
`;
const Avatar = styled.div`
  width:40px; height:40px; border-radius:50%; background:linear-gradient(135deg,#4cc9f0,#4361ee);
  display:flex; align-items:center; justify-content:center; font-weight:bold; color:white;flex-shrink:0;
`;
const Username = styled.span`
  font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
`;
const OnlineStatus = styled.div`
  display:flex; align-items:center; gap:.3rem; font-size:.8rem;
  color:${p => p.online ? '#4ade80' : '#9ca3af'};
  &::before{ content:''; width:8px; height:8px; border-radius:50%;
    background-color:${p => p.online ? '#4ade80' : '#9ca3af'}; }
`;
const Actions = styled.div`
  display:flex; gap:.5rem; flex-shrink:0;
`;
const GameModesGrid = styled.div`
  display:grid; gap:1rem; grid-template-columns:1fr;
  @media(min-width:768px){ grid-template-columns:repeat(2,1fr); }
`;
const GameModeCard = styled(motion.div)`
  background:rgba(15,23,42,0.7); border-radius:12px; padding:1.5rem;
  border:1px solid rgba(255,255,255,0.1); cursor:pointer;
  &:hover{ border-color:rgba(76,201,240,0.3); transform:translateY(-5px); box-shadow:0 10px 25px rgba(0,0,0,0.2); }
  position:relative; overflow:hidden;
  &::before{ content:''; position:absolute; top:0;left:0;right:0; height:4px; background:linear-gradient(to right,#4cc9f0,#4361ee);}
`;
const GameIcon = styled.div`
  width:60px; height:60px; border-radius:50%; background:rgba(76,201,240,0.1);
  display:flex; align-items:center; justify-content:center; font-size:1.8rem; color:#4cc9f0;
  margin-bottom:1rem; border:2px solid rgba(76,201,240,0.3);
`;
const GameTitle = styled.h3`
  color:#fff; margin:0 0 .5rem 0; font-size:1.2rem;
`;
const GameDescription = styled.p`
  color:rgba(255,255,255,0.7); margin:0 0 1rem 0; font-size:.9rem;
`;
const PlayButton = styled(motion.button)`
  padding:.5rem 1.5rem; border:none; border-radius:50px; cursor:pointer;
  background:linear-gradient(135deg,#9d4edd,#7b2cbf); color:#fff;
  animation:${pulse} 2s infinite; box-shadow:0 4px 15px rgba(157,78,221,0.3);
  &:hover{ transform:translateY(-2px); box-shadow:0 6px 20px rgba(157,78,221,0.4); animation:none; }
`;
const EmptyState = styled.div`
  padding:2rem 1rem; text-align:center; color:rgba(255,255,255,0.6);
  font-size:.9rem; border:1px dashed rgba(255,255,255,0.1); border-radius:8px;
`;
const LoadingText = styled.div`
  padding:1rem; text-align:center; color:rgba(255,255,255,0.6); font-size:.9rem;
`;
const ChallengeButton = styled(ButtonBase)`
  padding:.5rem 1rem; background:linear-gradient(135deg,#9d4edd,#7b2cbf);
  color:#fff; box-shadow:0 4px 10px rgba(157,78,221,0.3); font-size:.8rem;
  &:hover{ transform:translateY(-2px); box-shadow:0 6px 15px rgba(157,78,221,0.4); }
`;

// function toTitleCase(str) {
//   return str?.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase()+w.slice(1)).join(' ');
// }

const DashboardPage = () => {
  const auth = useSelector(s => s.auth);
  const user = auth.user?.user;
  const { friends, status: friendsStatus } = useSelector(s => s.friends);
  const { results: searchResults, loading: searchLoading } = useSelector(s => s.search);
  const { requests: incomingRequests, status: requestStatus } = useSelector(s => s.friendRequests);
  const { isConnected, onlineUsers } = useSelector(s => s.socket);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    dispatch(fetchFriends());
    dispatch(fetchFriendRequests());
    initializeSocket(user._id || user.id);
    const intv = setInterval(() => dispatch(fetchFriends()), 10000);
    return () => { clearInterval(intv); dispatch(clearSearchResults()); };
  }, [user, navigate, dispatch]);

  const handleSearch = e => { e.preventDefault(); searchQuery.trim() ? dispatch(searchUsers(searchQuery)) : dispatch(clearSearchResults()); };
  const handleSendRequest = id => dispatch(sendFriendRequest(id));
  const handleRespond = async (rid, act) => { await dispatch(respondToFriendRequest({ requestId: rid, action: act })).unwrap(); dispatch(fetchFriends()); dispatch(fetchFriendRequests()); };
  const handleLogout = async () => {
    await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/logout`, { userId: user._id || user.id });
    localStorage.removeItem('token');
    navigate('/auth');
  };
  const handlePlay = id => alert(`Game invitation sent to ${id}`);

  if (!user) return null;

  const enrichedFriends = friends.map(f => ({
    ...f, online: f.online || onlineUsers.includes(f._id)
  }));

  return (
    <DashboardContainer>
      <ContentWrapper>
        <Header>
          <Title>Game Zone<span>Welcome back, {user.username}!</span></Title>
          <HeaderControls>
            <StatusBadge connected={isConnected}>{isConnected ? 'Connected' : 'Disconnected'}</StatusBadge>
            <LogoutButton whileHover={{ y: -2 }} onClick={handleLogout}>Logout</LogoutButton>
          </HeaderControls>
        </Header>
        <MainGrid>
          {/* Search Section */}
          <Section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <SectionTitle>Search Users <span>{searchLoading ? '...' : ''}</span></SectionTitle>
            <SearchForm onSubmit={handleSearch}>
              <SearchInput placeholder="Search by username" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              <PrimaryButton type="submit" disabled={searchLoading}>Search</PrimaryButton>
            </SearchForm>
            {searchLoading && <LoadingText>Searching...</LoadingText>}
            <List>
              {searchResults.map(u => (
                <ListItem key={u._id} whileHover={{ x: 5 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <UserInfo>
                    <Avatar>{u.username.charAt(0)}</Avatar>
                    <Username>{u.username}</Username>
                    <OnlineStatus online={onlineUsers.includes(u._id)}>{onlineUsers.includes(u._id) ? 'Online' : 'Offline'}</OnlineStatus>
                  </UserInfo>
                  <Actions>
                    <SecondaryButton disabled={friends.some(f => f._id === u._id) || u.requestSent} onClick={() => handleSendRequest(u._id)}>
                      {friends.some(f => f._id === u._id) ? 'Friend' : u.requestSent ? 'Sent' : 'Add'}
                    </SecondaryButton>
                  </Actions>
                </ListItem>
              ))}
            </List>
          </Section>

          {/* Friends Section */}
          <Section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <SectionTitle>Friends List <span>{friends.length}</span></SectionTitle>
            {friendsStatus === 'loading' ? (
              <LoadingText>Loading...</LoadingText>
            ) : friends.length === 0 ? (
              <EmptyState>No friends yet. Add some!</EmptyState>
            ) : (
              <List>
                {enrichedFriends.map(f => (
                  <ListItem key={f._id} whileHover={{ x: 5 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <UserInfo>
                      <Avatar>{f.username.charAt(0)}</Avatar>
                      <Username>{f.username}</Username>
                      <OnlineStatus online={f.online}>{f.online ? 'Online' : 'Offline'}</OnlineStatus>
                    </UserInfo>
                    <Actions>
                      {f.online && <ChallengeButton onClick={() => handlePlay(f._id)}>Play</ChallengeButton>}
                    </Actions>
                  </ListItem>
                ))}
              </List>
            )}
          </Section>

          {/* Game Modes Section */}
          <Section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <SectionTitle>Game Modes</SectionTitle>
            <GameModesGrid>
              <GameModeCard whileHover={{ scale: 1.03 }}>
                <GameIcon>🖥️</GameIcon>
                <GameTitle>vs Computer</GameTitle>
                <GameDescription>Challenge the AI and improve your skills.</GameDescription>
                <PlayButton onClick={() => alert('Coming soon!')}>Play</PlayButton>
              </GameModeCard>
              <GameModeCard whileHover={{ scale: 1.03 }}>
                <GameIcon>🎮</GameIcon>
                <GameTitle>vs Friend</GameTitle>
                <GameDescription>Invite online friends to play.</GameDescription>
                <PlayButton disabled={enrichedFriends.filter(f => f.online).length === 0}>Play</PlayButton>
              </GameModeCard>
            </GameModesGrid>
          </Section>

          {/* Friend Requests Section */}
          <Section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <SectionTitle>Friend Requests <span>{incomingRequests.length}</span></SectionTitle>
            {requestStatus === 'loading' ? (
              <LoadingText>Loading...</LoadingText>
            ) : incomingRequests.length === 0 ? (
              <EmptyState>No new requests.</EmptyState>
            ) : (
              <List>
                {incomingRequests.map(r => (
                  <ListItem key={r._id} whileHover={{ x: 5 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <UserInfo>
                      <Avatar>{r.username.charAt(0)}</Avatar>
                      <Username>{r.username}</Username>
                    </UserInfo>
                    <Actions>
                      <SuccessButton onClick={() => handleRespond(r._id, 'accept')}>Accept</SuccessButton>
                      <DangerButton onClick={() => handleRespond(r._id, 'reject')}>Reject</DangerButton>
                    </Actions>
                  </ListItem>
                ))}
              </List>
            )}
          </Section>
        </MainGrid>
      </ContentWrapper>
    </DashboardContainer>
  );
};

export default DashboardPage;
