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
  width: 380px;
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

const CustomBetContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 1.5rem;
  width: 80%;
`;

const CustomBetInput = styled.input`
  padding: 0.5rem;
  border-radius: 5px;
  border: 2px solid #2196f3;
  background-color: rgba(0, 0, 0, 0.3);
  color: white;
  font-size: 0.85rem;
  width: 65%;
  text-align: center;
  
  &:focus {
    outline: none;
    border-color: #e2b714;
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
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

const ApplyCustomBetButton = styled(Button)`
  background-color: #2196f3;
  color: white;
  padding: 0.5rem;
  width: 35%;
  font-size: 0.85rem;
`;

const ChipsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
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

const GoldChip = styled(Chip)`
  background-color: #ffc107;
  color: #212121;
  font-size: 0.8rem;
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
  flex-wrap: wrap;
  justify-content: center;
`;

const PlaceBetButton = styled(Button)`
  background-color: #4caf50;
  color: white;
`;

const ClearButton = styled(Button)`
  background-color: #f44336;
  color: white;
`;

const RepeatBetButton = styled(Button)`
  background-color: #2196f3;
  color: white;
`;

const AllInButton = styled(Button)`
  background-color: #ff9800;
  color: white;
  font-weight: bold;
`;

const BettingPanel = ({ onBetComplete, playerBalance }) => {
  const { placeBet, lastBet } = useGame();
  const [currentBet, setCurrentBet] = useState(0);
  const [selectedChip, setSelectedChip] = useState(null);
  const [betPlaced, setBetPlaced] = useState(false);
  const [customBetValue, setCustomBetValue] = useState('');
  
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

  const handleRepeatBet = () => {
    if (lastBet <= 0 || lastBet > playerBalance) return;
    
    setCurrentBet(lastBet);
    placeBet(lastBet);
    setBetPlaced(true);
    
    if (onBetComplete && typeof onBetComplete === 'function') {
      onBetComplete();
    }
  };
  
  const handleAllIn = () => {
    setCurrentBet(playerBalance);
    setSelectedChip(null);
  };
  
  const handleCustomBetChange = (e) => {
    // Allow numbers and one decimal point
    const value = e.target.value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Ensure only two decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      return;
    }
    
    setCustomBetValue(value);
  };
  
  const handleApplyCustomBet = () => {
    const betValue = parseFloat(customBetValue);
    if (isNaN(betValue) || betValue <= 0 || betValue > playerBalance) return;
    
    // Round to 2 decimal places to avoid floating point issues
    const roundedBet = Math.round(betValue * 100) / 100;
    setCurrentBet(roundedBet);
    setSelectedChip(null);
    setCustomBetValue('');
  };
  
  const handleCustomBetKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleApplyCustomBet();
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
      
      <CustomBetContainer>
        <CustomBetInput 
          type="text" 
          placeholder="Custom Bet" 
          value={customBetValue}
          onChange={handleCustomBetChange}
          onKeyPress={handleCustomBetKeyPress}
        />
        <ApplyCustomBetButton onClick={handleApplyCustomBet}>Apply</ApplyCustomBetButton>
      </CustomBetContainer>
      
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
        <GoldChip 
          onClick={handleAllIn}
          selected={currentBet === playerBalance}
          disabled={playerBalance <= 0}
        >
          ALL IN
        </GoldChip>
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
        {lastBet > 0 && (
          <RepeatBetButton 
            onClick={handleRepeatBet} 
            disabled={lastBet > playerBalance}
          >
            Repeat ${lastBet}
          </RepeatBetButton>
        )}
      </ButtonsContainer>
    </BettingContainer>
  );
};

export default BettingPanel; 