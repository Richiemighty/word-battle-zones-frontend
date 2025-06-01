import React from 'react';

const categories = [
  'Animals',
  'Fruits',
  'Countries',
  'Movies',
  'Sports'
];

const GameOptions = ({ onCategorySelect, selectedCategory }) => {
  return (
    <div className="game-options">
      <h2>Game Options</h2>
      <div className="category-selection">
        <h3>Select Category:</h3>
        <div className="categories">
          {categories.map(category => (
            <button
              key={category}
              className={selectedCategory === category ? 'active' : ''}
              onClick={() => onCategorySelect(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      <div className="game-modes">
        <button className="play-button">Play vs Computer</button>
      </div>
    </div>
  );
};

export default GameOptions;