import React from 'react';
import styled from 'styled-components';

const CardContainer = styled.div`
  position: relative;
  width: 80px;
  height: 120px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  background-color: ${props => props.$hidden ? '#1E1E2E' : 'white'};
  color: ${props => props.$color === 'red' ? '#D32F2F' : '#212121'};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 5px;
  margin: 0 -15px;
  transition: transform 0.2s ease;
  transform-origin: bottom center;
  user-select: none;
  
  &:hover {
    transform: translateY(-10px);
    z-index: 10;
  }
`;

const CardPattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 6px;
  background-color: #1E1E2E;
  display: ${props => props.$hidden ? 'block' : 'none'};
  background-image: linear-gradient(45deg, #16213e 25%, transparent 25%),
    linear-gradient(-45deg, #16213e 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #16213e 75%),
    linear-gradient(-45deg, transparent 75%, #16213e 75%);
  background-size: 10px 10px;
  background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
`;

const CardBack = styled.div`
  position: absolute;
  top: 10%;
  left: 10%;
  width: 80%;
  height: 80%;
  border-radius: 3px;
  background-color: #101020;
  display: ${props => props.$hidden ? 'block' : 'none'};
  border: 2px solid #e2b714;
`;

const CardTop = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const CardBottom = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  transform: rotate(180deg);
`;

const CardCenter = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  font-weight: bold;
`;

const CardValue = styled.div`
  font-size: 1.1rem;
  font-weight: bold;
  line-height: 1;
`;

const CardSuit = styled.div`
  font-size: 1.1rem;
  line-height: 1;
`;

// Helper function to get card suit symbol
const getSuitSymbol = (suit) => {
  switch (suit) {
    case 'hearts':
      return '♥';
    case 'diamonds':
      return '♦';
    case 'clubs':
      return '♣';
    case 'spades':
      return '♠';
    default:
      return '';
  }
};

// Helper function to get card color
const getCardColor = (suit) => {
  return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
};

// Helper function to get card display value
const getCardValue = (value) => {
  switch (value) {
    case 'ace':
      return 'A';
    case 'king':
      return 'K';
    case 'queen':
      return 'Q';
    case 'jack':
      return 'J';
    default:
      return value;
  }
};

const Card = ({ card, hidden = false }) => {
  if (!card && !hidden) return null;
  
  // If card is hidden, just show the back
  if (hidden) {
    return (
      <CardContainer $hidden={true}>
        <CardPattern $hidden={true} />
        <CardBack $hidden={true} />
      </CardContainer>
    );
  }
  
  const { suit, value } = card;
  const color = getCardColor(suit);
  const suitSymbol = getSuitSymbol(suit);
  const displayValue = getCardValue(value);
  
  return (
    <CardContainer $color={color}>
      <CardTop>
        <CardValue>{displayValue}</CardValue>
        <CardSuit>{suitSymbol}</CardSuit>
      </CardTop>
      
      <CardCenter>
        {suitSymbol}
      </CardCenter>
      
      <CardBottom>
        <CardValue>{displayValue}</CardValue>
        <CardSuit>{suitSymbol}</CardSuit>
      </CardBottom>
    </CardContainer>
  );
};

export default Card; 