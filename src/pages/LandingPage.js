import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { FaUserFriends, FaTrophy, FaGamepad, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { GiBrain, GiClockwork, GiSwordWound } from 'react-icons/gi';
import './LandingPage.css'; // We'll create this CSS file

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Preload animation assets
    const timer = setTimeout(() => {
      const el = document.querySelector('.hero-section');
      if (el) el.style.opacity = '1';
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="landing-page">
      {/* Animated Hero Section */}
      <motion.section 
        className="hero-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="particles-background"></div>
        
        <motion.div 
          className="hero-content"
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h1 className="game-title">
            <TypeAnimation
              sequence={[
                'WORD BATTLE ZONES',
                1000,
                'WORD BATTLE ZONES!',
                1000
              ]}
              wrapper="span"
              speed={25}
              repeat={Infinity}
            />
          </h1>
          
          <motion.p 
            className="tagline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            The Ultimate Vocabulary Duel
          </motion.p>
          
          <motion.div
            className="cta-buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <button 
              onClick={() => navigate('/auth')}
              className="btn-login"
            >
              <FaSignInAlt /> Sign In
            </button>
            <button 
              onClick={() => navigate('/auth')}
              className="btn-signup"
            >
              <FaUserPlus /> Sign Up
            </button>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="hero-image"
          animate={{
            y: [0, -15, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <img src="/word-battle-hero.png" alt="Word Battle Illustration" />
        </motion.div>
      </motion.section>

      {/* Game Features Section */}
      <section className="features-section">
        <motion.h2
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Why Play Word Battle Zones?
        </motion.h2>
        
        <div className="features-grid">
          <motion.div 
            className="feature-card"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <FaUserFriends className="feature-icon" />
            <h3>Multiplayer Battles</h3>
            <p>Challenge friends or random opponents in real-time word duels</p>
          </motion.div>
          
          <motion.div 
            className="feature-card"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <GiBrain className="feature-icon" />
            <h3>Brain Training</h3>
            <p>Improve your vocabulary and quick thinking under pressure</p>
          </motion.div>
          
          <motion.div 
            className="feature-card"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <FaTrophy className="feature-icon" />
            <h3>Competitive Leaderboards</h3>
            <p>Climb the ranks and prove you're the vocabulary champion</p>
          </motion.div>
        </div>
      </section>

      {/* How to Play Section */}
      <section className="instructions-section">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <h2>How To Play</h2>
          
          <div className="steps-container">
            <motion.div 
              className="step"
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Choose Your Category</h3>
                <p>Select from animals, fruits, countries, or create custom categories</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="step"
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Battle Begins</h3>
                <p>Players take turns naming items in the category within 30 seconds</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="step"
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Win the Duel</h3>
                <p>Last player to give a valid answer wins the round. First to 1000 points wins!</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Game Rules Section */}
      <section className="rules-section">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <h2>Game Rules</h2>
          
          <motion.ul
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            viewport={{ once: true }}
          >
            <motion.li
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <GiClockwork /> Each player has 30 seconds to respond
            </motion.li>
            <motion.li
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <GiSwordWound /> No repeating words - duplicates make you lose the round
            </motion.li>
            <motion.li
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <FaGamepad /> Faster responses earn bonus points
            </motion.li>
            <motion.li
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GiBrain /> Invalid words result in 5-second penalty
            </motion.li>
          </motion.ul>
        </motion.div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <h2>Ready for the Ultimate Word Battle?</h2>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button 
              onClick={() => navigate('/auth?mode=register')}
              className="btn-main-cta"
            >
              Join the Battle Now
            </button>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;