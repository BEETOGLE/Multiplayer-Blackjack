import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import { GameProvider } from './contexts/GameContext';

// Pages
import Home from './pages/Home';
import GameRoom from './pages/GameRoom';
import Rules from './pages/Rules';
import Leaderboard from './pages/Leaderboard';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Poppins', sans-serif;
  }
  
  body, html {
    height: 100%;
    background-color: #0a0a0a;
    color: #fff;
  }
  
  #root {
    height: 100%;
  }
`;

function App() {
  return (
    <Router>
      <GlobalStyle />
      <GameProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game-room" element={<GameRoom />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </GameProvider>
    </Router>
  );
}

export default App; 