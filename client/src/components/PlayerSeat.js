import React from 'react';
import styled from 'styled-components';
import Card from './Card';

const SeatContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 200px;
  position: relative;
  margin: 0 15px 20px;
`;

const UsernameDisplay = styled.div`
  font-size: 1rem;
  font-weight: 600;
  padding: 5px 12px;
  margin-bottom: 5px;
  background-color: ${props => props.$isCurrentPlayer ? '#4caf50' : '#333'};
  color: white;
  border-radius: 20px;
  text-align: center;
  min-width: 100px;
  z-index: 5;
`;

const BalanceDisplay = styled.div`
  font-size: 0.9rem;
  padding: 4px 10px;
  background-color: #2c2c44;
  color: #e2b714;
  border-radius: 4px;
  margin-bottom: 10px;
  z-index: 5;
`;

const CardArea = styled.div`
  display: flex;
  justify-content: center;
  min-height: 130px;
  margin-bottom: 10px;
  position: relative;
`;

const BetCircle = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: ${props => props.$active ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border: 2px solid ${props => props.$active ? '#4caf50' : '#444'};
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-top: 10px;
  z-index: 1;
`;

const BetAmount = styled.div`
  background-color: #e2b714;
  color: #000;
  font-weight: bold;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.9rem;
  position: absolute;
  top: -15px;
  z-index: 6;
`;

const ScoreChip = styled.div`
  position: absolute;
  top: 45px;
  right: -15px;
  background-color: #2c2c44;
  color: ${props => props.$score > 21 ? '#f44336' : props.$score === 21 ? '#e2b714' : 'white'};
  border: 1px solid ${props => props.$score > 21 ? '#f44336' : props.$score === 21 ? '#e2b714' : '#444'};
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 0.9rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 10;
`;

const StatusBadge = styled.div`
  position: absolute;
  top: 95px;
  right: 20px;
  background-color: ${props => {
    if (props.$status === 'busted') return '#f44336';
    if (props.$status === 'blackjack') return '#e2b714';
    if (props.$status === 'stood') return '#2196f3';
    if (props.$status === 'surrendered') return '#757575';
    return 'transparent';
  }};
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
  z-index: 10;
`;

const YourTurnIndicator = styled.div`
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #e2b714;
  color: #000;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  animation: pulse 1.5s infinite;
  z-index: 20;
  
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(226, 183, 20, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(226, 183, 20, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(226, 183, 20, 0);
    }
  }
`;

const getStatusLabel = (status) => {
  switch (status) {
    case 'busted':
      return 'Busted!';
    case 'blackjack':
      return 'Blackjack!';
    case 'stood':
      return 'Stand';
    case 'surrendered':
      return 'Fold';
    case 'spectating':
      return 'Spectating';
    default:
      return '';
  }
};

const PlayerSeat = ({ 
  player, 
  isCurrentPlayer, 
  isPlayerTurn,
  gameState
}) => {
  if (!player) return <SeatContainer />;
  
  const { username, balance, cards, bet, status, score } = player;
  
  // Check if this is a split hand belonging to the current player
  const isSplitHandOfCurrentPlayer = player.id.includes('-split') && isCurrentPlayer;
  
  // Don't show "Your Turn" indicator if player has blackjack
  const showTurnIndicator = isPlayerTurn && status !== 'blackjack';
  
  return (
    <SeatContainer>
      {showTurnIndicator && <YourTurnIndicator>Your Turn</YourTurnIndicator>}
      
      <UsernameDisplay $isCurrentPlayer={isCurrentPlayer || isSplitHandOfCurrentPlayer}>
        {username}
      </UsernameDisplay>
      
      <BalanceDisplay>
        ${balance.toLocaleString()}
      </BalanceDisplay>
      
      <CardArea>
        {cards && cards.map((card, index) => (
          <Card key={index} card={card} />
        ))}
      </CardArea>
      
      {score > 0 && <ScoreChip $score={score}>{score}</ScoreChip>}
      
      {status && <StatusBadge $status={status}>
        {getStatusLabel(status)}
      </StatusBadge>}
      
      <BetCircle $active={bet > 0}>
        {bet > 0 && <BetAmount>${bet}</BetAmount>}
      </BetCircle>
    </SeatContainer>
  );
};

export default PlayerSeat; 