import React, { useEffect, useState } from 'react';
import axios from 'api/axios';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [filter, setFilter] = useState('global'); // 'global' or 'friends'

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get(`/api/leaderboard?type=${filter}`);
        setLeaderboard(response.data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };
    fetchLeaderboard();
  }, [filter]);

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h2>Leaderboard</h2>
        <div className="filter-buttons">
          <button 
            className={filter === 'global' ? 'active' : ''}
            onClick={() => setFilter('global')}
          >
            Global
          </button>
          <button 
            className={filter === 'friends' ? 'active' : ''}
            onClick={() => setFilter('friends')}
          >
            Friends
          </button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Wins</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((player, index) => (
            <tr key={player._id}>
              <td>{index + 1}</td>
              <td>{player.username}</td>
              <td>{player.stats.wins}</td>
              <td>{player.stats.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;