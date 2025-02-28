import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useGame } from '../contexts/GameContext';

// Import components
import PlayerSeat from '../components/PlayerSeat';
import DealerArea from '../components/DealerArea';
import PlayerControls from '../components/PlayerControls';
import BettingPanel from '../components/BettingPanel';
import Chat from '../components/Chat';
import GameHistory from '../components/GameHistory';

const GameRoomContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)), 
              url('/images/table-background.jpg') no-repeat center center/cover;
  color: white;
  overflow: hidden;
`;

const GameHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 25px;
  background-color: rgba(0, 0, 0, 0.7);
  border-bottom: 2px solid #144b2f;
`;

const RoomInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const RoomTitle = styled.h1`
  font-size: 22px;
  color: #e5c687;
  margin: 0;
`;

const RoomCode = styled.div`
  background-color: #144b2f;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 1px;
`;

const PlayerCount = styled.div`
  display: flex;
  align-items: center;
  color: #bbb;
  font-size: 14px;
  
  svg {
    margin-right: 5px;
  }
`;

const LeaveButton = styled.button`
  background-color: #d32f2f;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #b71c1c;
  }
`;

const GameContent = styled.div`
  display: flex;
  height: calc(100vh - 66px); // Subtract header height
`;

const GameTable = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 20px;
  overflow: hidden;
`;

const DealerSection = styled.div`
  height: 30%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin-bottom: 20px;
`;

const PlayersSection = styled.div`
  height: 50%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
`;

const ControlsSection = styled.div`
  height: 20%;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 20px;
`;

const SidebarContainer = styled.div`
  width: 350px;
  background-color: rgba(0, 0, 0, 0.8);
  border-left: 2px solid #144b2f;
  display: flex;
  flex-direction: column;
`;

const StartGameButton = styled.button`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #e5c687;
  color: #0a2219;
  border: none;
  padding: 15px 30px;
  border-radius: 5px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  
  &:hover {
    background-color: #f0d498;
    transform: translate(-50%, -52%);
    box-shadow: 0 7px 20px rgba(0, 0, 0, 0.4);
  }
`;

const WaitingMessage = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #e5c687;
  
  h2 {
    font-size: 28px;
    margin-bottom: 10px;
  }
  
  p {
    font-size: 16px;
    color: #bbb;
    max-width: 400px;
  }
`;

const ErrorMessage = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(211, 47, 47, 0.9);
  color: white;
  padding: 12px 20px;
  border-radius: 5px;
  z-index: 1000;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
`;

const GameRoom = () => {
  const navigate = useNavigate();
  const { 
    connected, roomId, players, dealer, gameState, error,
    startGame, leaveRoom, getCurrentPlayer, isPlayerTurn, currentTurn
  } = useGame();
  
  // Redirect if not connected or no room joined
  useEffect(() => {
    if (connected && !roomId) {
      navigate('/');
    }
  }, [connected, roomId, navigate]);
  
  // Current player
  const currentPlayer = getCurrentPlayer();
  
  // Handler for leaving room
  const handleLeaveRoom = () => {
    leaveRoom();
    navigate('/');
  };
  
  // Check if user is the host (first player)
  const isHost = players.length > 0 && currentPlayer?.id === players[0]?.id;
  
  // Render player seats based on number of players
  const renderPlayerSeats = () => {
    return players.map((player, index) => {
      // Check if this is the current player or a split hand of the current player
      const isMainPlayer = player.id === currentPlayer?.id;
      const isSplitHandOfCurrentPlayer = player.originalPlayer === currentPlayer?.id;
      const isThisCurrentPlayer = isMainPlayer || isSplitHandOfCurrentPlayer;
      
      return (
        <PlayerSeat 
          key={player.id}
          player={player}
          isCurrentPlayer={isThisCurrentPlayer}
          isPlayerTurn={player.id === currentTurn}
          position={index}
          gameState={gameState}
        />
      );
    });
  };
  
  // Render appropriate controls based on game state
  const renderControls = () => {
    // Get the current player (either main hand or split hand based on whose turn it is)
    const activePlayer = getCurrentPlayer();
    
    // Skip controls if player has blackjack
    const hasBlackjack = activePlayer?.status === 'blackjack';
    
    // Check if player can split (has exactly 2 cards with the same value)
    const canSplit = activePlayer?.cards?.length === 2 && 
      activePlayer.cards[0].value === activePlayer.cards[1].value &&
      activePlayer.balance >= activePlayer.bet &&
      !activePlayer.id.includes('-split'); // Can't split a split hand
    
    if (gameState === 'betting') {
      // Don't show betting panel for players with zero balance
      if (currentPlayer?.balance <= 0) {
        return (
          <div style={{ 
            textAlign: 'center', 
            padding: '15px', 
            backgroundColor: 'rgba(0,0,0,0.7)',
            borderRadius: '10px',
            color: '#e2b714'
          }}>
            You are out of funds and will spectate this round
          </div>
        );
      }
      
      const handleBetComplete = () => {
        // This is a placeholder function that will be called when a bet is placed
        console.log('Bet placed successfully');
      };
      
      return <BettingPanel 
        onBetComplete={handleBetComplete} 
        playerBalance={currentPlayer?.balance || 0} 
      />;
    } else if (gameState === 'playing' && isPlayerTurn() && !hasBlackjack) {
      return <PlayerControls currentPlayer={activePlayer} canSplit={canSplit} />;
    } else if (gameState === 'ended') {
      return <PlayerControls currentPlayer={currentPlayer} canSplit={false} />;
    }
    
    // If it's not the player's turn or they have blackjack, don't show controls
    return null;
  };
  
  return (
    <GameRoomContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <GameHeader>
        <RoomInfo>
          <RoomTitle>Blackjack Table</RoomTitle>
          {roomId && <RoomCode>Room: {roomId}</RoomCode>}
          <PlayerCount>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16,21H8A1,1 0 0,1 7,20V12.07L5.7,13.07C5.31,13.46 4.68,13.46 4.29,13.07L1.46,10.29C1.07,9.9 1.07,9.27 1.46,8.88L7.34,3H9C9,4.1 10.34,5 12,5C13.66,5 15,4.1 15,3H16.66L22.54,8.88C22.93,9.27 22.93,9.9 22.54,10.29L19.71,13.12C19.32,13.5 18.69,13.5 18.3,13.12L17,12.12V20A1,1 0 0,1 16,21"></path>
            </svg>
            {players.length} Player{players.length !== 1 ? 's' : ''}
          </PlayerCount>
        </RoomInfo>
        
        <LeaveButton onClick={handleLeaveRoom}>Leave Table</LeaveButton>
      </GameHeader>
      
      <GameContent>
        <GameTable>
          <DealerSection>
            {(gameState === 'playing' || gameState === 'ended') && (
              <DealerArea dealer={dealer} gameState={gameState} currentTurn={currentTurn} />
            )}
          </DealerSection>
          
          <PlayersSection>
            {renderPlayerSeats()}
          </PlayersSection>
          
          <ControlsSection>
            {renderControls()}
          </ControlsSection>
          
          {gameState === 'waiting' && (
            <>
              {isHost && players.length >= 2 ? (
                <StartGameButton onClick={startGame}>
                  Start Game
                </StartGameButton>
              ) : (
                <WaitingMessage>
                  <h2>Waiting for players...</h2>
                  <p>
                    {isHost 
                      ? 'You need at least one more player to start the game.' 
                      : 'Waiting for the host to start the game.'}
                  </p>
                </WaitingMessage>
              )}
            </>
          )}
        </GameTable>
        
        <SidebarContainer>
          <Chat />
          <GameHistory />
        </SidebarContainer>
      </GameContent>
    </GameRoomContainer>
  );
};

export default GameRoom; 