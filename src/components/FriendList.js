import React from 'react';
import { useSelector } from 'react-redux';

const FriendList = ({ onInvite }) => {
  const { user } = useSelector(state => state.auth);
  const { onlineUsers } = useSelector(state => state.socket);

  return (
    <div className="friend-list">
      <h2>Friends</h2>
      <ul>
        {user?.friends?.map(friend => (
          <li key={friend._id || friend.id}>
            <span>{friend.username}</span>
            <span className={`status ${onlineUsers.includes(friend._id || friend.id) ? 'online' : 'offline'}`}>
              {onlineUsers.includes(friend._id || friend.id) ? 'Online' : 'Offline'}
            </span>
            <button 
              onClick={() => onInvite(friend._id || friend.id)}
              disabled={!onlineUsers.includes(friend._id || friend.id)}
            >
              Invite to Game
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendList;