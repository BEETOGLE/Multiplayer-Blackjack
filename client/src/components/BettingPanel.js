import React, { useState } from 'react';
import styled from 'styled-components';
import { useGame } from '../contexts/GameContext';

const BettingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba(30, 30, 46, 0.8);
  padding: 1.5rem;
  border-radius: 10px;
  position: absolute;
  z-index: 100;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  width: 350px;
  left: 50%;
  transform: translateX(-50%);
  bottom: 100px;
`;

const Title = styled.h3`
  margin-bottom: 1.5rem;
  color: #e2b714;
  text-align: center;
  font-size: 1.3rem;
`;

const ChipsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 1.5rem;
`;

const Chip = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s;
  border: 2px dashed transparent;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  ${props => props.selected && `
    border: 2px dashed white;
    transform: translateY(-5px);
  `}
  
  ${props => props.disabled && `
    opacity: 0.5;
    cursor: not-allowed;
    &:hover {
      transform: none;
    }
  `}
`;

const RedChip = styled(Chip)`
  background-color: #f44336;
  color: white;
`;

const BlueChip = styled(Chip)`
  background-color: #2196f3;
  color: white;
`;

const GreenChip = styled(Chip)`
  background-color: #4caf50;
  color: white;
`;

const BlackChip = styled(Chip)`
  background-color: #212121;
  color: white;
`;

const PurpleChip = styled(Chip)`
  background-color: #9c27b0;
  color: white;
`;

const BetDisplay = styled.div`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  font-weight: bold;
  color: #e2b714;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  border-radius: 5px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    &:hover {
      transform: none;
    }
  }
`;

const PlaceBetButton = styled(Button)`
  background-color: #4caf50;
  color: white;
`;

const ClearButton = styled(Button)`
  background-color: #f44336;
  color: white;
`;

const BettingPanel = ({ onBetComplete, playerBalance }) => {
  const { placeBet } = useGame();
  const [currentBet, setCurrentBet] = useState(0);
  const [selectedChip, setSelectedChip] = useState(null);
  const [betPlaced, setBetPlaced] = useState(false);
  
  const chipValues = [5, 10, 25, 50, 100];
  
  const handleChipClick = (value) => {
    if (playerBalance < value || playerBalance < currentBet + value) return;
    
    setCurrentBet(prev => prev + value);
    setSelectedChip(value);
  };
  
  const handleClearBet = () => {
    setCurrentBet(0);
    setSelectedChip(null);
  };
  
  const handlePlaceBet = () => {
    if (currentBet <= 0) return;
    
    placeBet(currentBet);
    setBetPlaced(true);
    
    if (onBetComplete && typeof onBetComplete === 'function') {
      onBetComplete();
    }
  };
  
  const isChipDisabled = (value) => {
    return playerBalance < value || playerBalance < currentBet + value;
  };
  
  // Don't render the panel if bet has been placed
  if (betPlaced) {
    return null;
  }
  
  return (
    <BettingContainer>
      <Title>Place Your Bet</Title>
      
      <ChipsContainer>
        <RedChip 
          onClick={() => handleChipClick(5)}
          selected={selectedChip === 5}
          disabled={isChipDisabled(5)}
        >
          $5
        </RedChip>
        <BlueChip 
          onClick={() => handleChipClick(10)}
          selected={selectedChip === 10}
          disabled={isChipDisabled(10)}
        >
          $10
        </BlueChip>
        <GreenChip 
          onClick={() => handleChipClick(25)}
          selected={selectedChip === 25}
          disabled={isChipDisabled(25)}
        >
          $25
        </GreenChip>
        <BlackChip 
          onClick={() => handleChipClick(50)}
          selected={selectedChip === 50}
          disabled={isChipDisabled(50)}
        >
          $50
        </BlackChip>
        <PurpleChip 
          onClick={() => handleChipClick(100)}
          selected={selectedChip === 100}
          disabled={isChipDisabled(100)}
        >
          $100
        </PurpleChip>
      </ChipsContainer>
      
      <BetDisplay>
        ${currentBet}
      </BetDisplay>
      
      <ButtonsContainer>
        <ClearButton onClick={handleClearBet} disabled={currentBet === 0}>
          Clear
        </ClearButton>
        <PlaceBetButton 
          onClick={handlePlaceBet} 
          disabled={currentBet === 0}
        >
          Place Bet
        </PlaceBetButton>
      </ButtonsContainer>
    </BettingContainer>
  );
};

export default BettingPanel; 