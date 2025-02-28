import React from 'react';
import styled from 'styled-components';
import { useGame } from '../contexts/GameContext';

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
  background-color: rgba(30, 30, 46, 0.8);
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  width: 100%;
  margin-bottom: 1rem;
  
  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ActionButton = styled.button`
  padding: 0.8rem 0;
  border-radius: 5px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  &:hover:not(:disabled) {
    transform: translateY(-3px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    margin-bottom: 5px;
    font-size: 1.2rem;
  }
`;

const HitButton = styled(ActionButton)`
  background-color: #4caf50;
  color: white;
`;

const StandButton = styled(ActionButton)`
  background-color: #f44336;
  color: white;
`;

const DoubleButton = styled(ActionButton)`
  background-color: #2196f3;
  color: white;
`;

const SplitButton = styled(ActionButton)`
  background-color: #ff9800;
  color: white;
`;

const SurrenderButton = styled(ActionButton)`
  background-color: #9e9e9e;
  color: white;
`;

const NewRoundButton = styled(ActionButton)`
  background-color: #9c27b0;
  color: white;
  grid-column: span 2;
`;

const Icon = styled.span`
  font-size: 1.5rem;
  margin-bottom: 5px;
`;

const ButtonText = styled.span`
  font-size: 0.9rem;
`;

const PlayerControls = ({ currentPlayer, canSplit }) => {
  const { 
    hit, 
    stand, 
    doubleDown, 
    split, 
    surrender, 
    startNewRound, 
    gameState, 
    isPlayerTurn
  } = useGame();
  
  // Check if it's the player's turn directly
  const playerTurn = isPlayerTurn();
  
  // Check if this is a split hand
  const isSplitHand = currentPlayer?.id?.includes('-split');
  
  const isFirstAction = currentPlayer?.cards?.length === 2;
  const isGameEnded = gameState === 'ended';
  
  // Check if player can double down (only with first 2 cards)
  const canDoubleDown = playerTurn && isFirstAction;
  
  // Check if player can surrender (only as first action)
  const canSurrender = playerTurn && isFirstAction;
  
  // Can't split a split hand
  const canSplitHand = canSplit && !isSplitHand;
  
  return (
    <ControlsContainer>
      <ActionsGrid>
        {isGameEnded ? (
          <NewRoundButton onClick={startNewRound}>
            <Icon>🔄</Icon>
            <ButtonText>New Round</ButtonText>
          </NewRoundButton>
        ) : (
          <>
            <HitButton 
              onClick={hit} 
              disabled={!playerTurn}
              title="Draw another card"
            >
              <Icon>👆</Icon>
              <ButtonText>Hit</ButtonText>
            </HitButton>
            
            <StandButton 
              onClick={stand} 
              disabled={!playerTurn}
              title="End your turn"
            >
              <Icon>✋</Icon>
              <ButtonText>Stand</ButtonText>
            </StandButton>
            
            <DoubleButton 
              onClick={doubleDown} 
              disabled={!playerTurn || !canDoubleDown}
              title="Double your bet and receive one more card"
            >
              <Icon>💰</Icon>
              <ButtonText>Double</ButtonText>
            </DoubleButton>
            
            <SplitButton 
              onClick={split} 
              disabled={!playerTurn || !canSplitHand}
              title="Split your pair into two hands"
            >
              <Icon>✂️</Icon>
              <ButtonText>Split</ButtonText>
            </SplitButton>
            
            <SurrenderButton 
              onClick={surrender} 
              disabled={!playerTurn || !canSurrender}
              title="Forfeit half your bet and end your hand"
            >
              <Icon>🏳️</Icon>
              <ButtonText>Surrender</ButtonText>
            </SurrenderButton>
          </>
        )}
      </ActionsGrid>
    </ControlsContainer>
  );
};

export default PlayerControls; 