import React from 'react';
import { useDispatch } from 'react-redux';
import { removeGameInvite } from '../features/socket/socketSlice';

const GameInviteModal = ({ invites, currentUserId }) => {
  const dispatch = useDispatch();

  const handleResponse = (inviteId, accepted) => {
    // Here you would emit a socket event to respond to the invite
    dispatch(removeGameInvite(inviteId));
    if (accepted) {
      // Start the game
    }
  };

  return (
    <div className="game-invite-modal">
      {invites.map(invite => (
        <div key={invite.id} className="invite">
          <p>{invite.from.username} invited you to play {invite.category}</p>
          <div className="invite-actions">
            <button onClick={() => handleResponse(invite.id, true)}>Accept</button>
            <button onClick={() => handleResponse(invite.id, false)}>Decline</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GameInviteModal;