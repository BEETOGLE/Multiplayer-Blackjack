import React from 'react';
import styled from 'styled-components';
import { useGame } from '../contexts/GameContext';

const HistoryContainer = styled.div`
  width: 100%;
  max-width: 350px;
  background-color: rgba(30, 30, 46, 0.8);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

const HistoryHeader = styled.div`
  padding: 12px;
  background-color: #272736;
  font-weight: 600;
  color: #e2b714;
  border-bottom: 1px solid #333;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
    font-size: 1.2rem;
  }
`;

const HistoryList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #1e1e2e;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #444;
  }
`;

const HistoryItem = styled.div`
  padding: 12px;
  border-bottom: 1px solid #333;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const RoundHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 0.85rem;
  color: #aaa;
`;

const RoundNumber = styled.div`
  font-weight: 600;
`;

const TimeStamp = styled.div``;

const ResultGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`;

const PlayerResult = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  background-color: ${props => {
    if (props.result === 'win') return 'rgba(76, 175, 80, 0.2)';
    if (props.result === 'lose') return 'rgba(244, 67, 54, 0.2)';
    if (props.result === 'push') return 'rgba(255, 152, 0, 0.2)';
    if (props.result === 'blackjack') return 'rgba(226, 183, 20, 0.2)';
    return 'rgba(255, 255, 255, 0.1)';
  }};
  border: 1px solid ${props => {
    if (props.result === 'win') return '#4caf50';
    if (props.result === 'lose') return '#f44336';
    if (props.result === 'push') return '#ff9800';
    if (props.result === 'blackjack') return '#e2b714';
    return '#444';
  }};
`;

const Username = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 4px;
  color: #f5f5f5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`;

const ResultLabel = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  color: ${props => {
    if (props.result === 'win') return '#4caf50';
    if (props.result === 'lose') return '#f44336';
    if (props.result === 'push') return '#ff9800';
    if (props.result === 'blackjack') return '#e2b714';
    return '#f5f5f5';
  }};
`;

const AmountChange = styled.div`
  font-size: 0.85rem;
  color: ${props => {
    if (props.amount > 0) return '#4caf50';
    if (props.amount < 0) return '#f44336';
    return '#f5f5f5';
  }};
`;

const EmptyState = styled.div`
  padding: 20px;
  text-align: center;
  color: #888;
  font-style: italic;
`;

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getResultLabel = (result) => {
  switch (result) {
    case 'win':
      return 'WIN';
    case 'lose':
      return 'LOSE';
    case 'push':
      return 'PUSH';
    case 'blackjack':
      return 'BLACKJACK';
    default:
      return '';
  }
};

const GameHistory = () => {
  const { gameHistory = [] } = useGame();
  
  return (
    <HistoryContainer>
      <HistoryHeader>
        <span>📋</span> Game History
      </HistoryHeader>
      
      <HistoryList>
        {gameHistory && gameHistory.length > 0 ? (
          gameHistory.map((round, index) => (
            <HistoryItem key={index}>
              <RoundHeader>
                <RoundNumber>Round {round.roundNumber || gameHistory.length - index}</RoundNumber>
                <TimeStamp>{formatTime(round.timestamp || Date.now())}</TimeStamp>
              </RoundHeader>
              
              <ResultGrid>
                {round.results && round.results.map((result, playerIndex) => (
                  <PlayerResult 
                    key={playerIndex} 
                    result={result.outcome}
                  >
                    <Username>{result.username}</Username>
                    <ResultLabel result={result.outcome}>
                      {getResultLabel(result.outcome)}
                    </ResultLabel>
                    <AmountChange amount={result.amountChange}>
                      {result.amountChange > 0 ? '+' : ''}{result.amountChange}
                    </AmountChange>
                  </PlayerResult>
                ))}
              </ResultGrid>
            </HistoryItem>
          ))
        ) : (
          <EmptyState>No game history yet.</EmptyState>
        )}
      </HistoryList>
    </HistoryContainer>
  );
};

export default GameHistory; 