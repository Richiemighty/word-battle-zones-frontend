import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { updateGame } from '../features/socket/socketSlice';

const GameScreen = () => {
  const { gameId } = useParams();
  const { user } = useSelector(state => state.auth);
  const { socket, currentGame } = useSelector(state => state.socket);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [inputWord, setInputWord] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!socket) return;

    socket.on('gameUpdate', (gameState) => {
      dispatch(updateGame(gameState));
    });

    socket.on('gameOver', (result) => {
      alert(`Game Over! ${result.winner ? `${result.winner} won!` : 'Draw!'}`);
      navigate('/');
    });

    return () => {
      socket.off('gameUpdate');
      socket.off('gameOver');
    };
  }, [socket, dispatch, navigate]);

  useEffect(() => {
    const timer = timeLeft > 0 && setInterval(() => {
      setTimeLeft(t => {
        if (t === 1) handleTimeout();
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSubmit = () => {
    if (!inputWord.trim()) return;
    socket.emit('submitWord', { gameId, word: inputWord });
    setInputWord('');
    setTimeLeft(30);
  };

  const handleTimeout = () => {
    socket.emit('timeout', { gameId });
  };

  if (!currentGame) return <div>Loading game...</div>;

  return (
    <div className="game-container">
      <div className="game-header">
        <h2>{currentGame.category}</h2>
        <div className="timer">Time: {timeLeft}s</div>
      </div>

      <div className="game-board">
        <div className="used-words">
          <h3>Used Words:</h3>
          <ul>
            {currentGame.wordsUsed.map((word, i) => (
              <li key={i}>{word}</li>
            ))}
          </ul>
        </div>

        {currentGame.currentPlayer === user._id && (
          <div className="word-input">
            <input
              type="text"
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
              placeholder="Your word..."
            />
            <button onClick={handleSubmit}>Submit</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameScreen;