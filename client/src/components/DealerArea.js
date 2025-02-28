import React from 'react';
import styled from 'styled-components';
import Card from './Card';

const DealerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 300px;
`;

const DealerTitle = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  padding: 5px 15px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 20px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DealerScore = styled.span`
  margin-left: 10px;
  background-color: ${props => props.$score > 21 ? '#f44336' : props.$score >= 17 ? '#e2b714' : '#4caf50'};
  color: ${props => props.$score > 21 ? 'white' : props.$score >= 17 ? 'black' : 'white'};
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.9rem;
`;

const CardArea = styled.div`
  display: flex;
  justify-content: center;
  min-height: 130px;
  position: relative;
`;

const DealerStatus = styled.div`
  margin-top: 5px;
  font-size: 0.9rem;
  color: #e2b714;
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

const DealerArea = ({ dealer, gameState, currentTurn }) => {
  const { cards, score } = dealer;
  const isDealerTurn = currentTurn === 'dealer';
  const showAllCards = gameState === 'ended' || isDealerTurn;
  
  // Calculate visible score (only count visible cards)
  const visibleScore = showAllCards ? score : 
    cards && cards.length > 0 ? calculateVisibleScore(cards) : 0;
  
  // Determine dealer status text
  const getDealerStatus = () => {
    if (showAllCards) {
      if (score > 21) return 'Dealer busts!';
      if (score >= 17) return 'Dealer stands on ' + score;
      return 'Dealer hits';
    }
    return 'Dealer stands on 17';
  };
  
  // Calculate score for visible cards only
  function calculateVisibleScore(cards) {
    if (!cards || cards.length === 0) return 0;
    
    // Only count the first card if second card is hidden
    const visibleCards = showAllCards ? cards : [cards[0]];
    
    let score = 0;
    let aces = 0;
    
    // Count score and aces
    for (const card of visibleCards) {
      if (card.value === 'ace') {
        aces++;
        score += 11;
      } else if (['king', 'queen', 'jack'].includes(card.value)) {
        score += 10;
      } else {
        score += parseInt(card.value);
      }
    }
    
    // Convert aces from 11 to 1 as needed to avoid busting
    while (score > 21 && aces > 0) {
      score -= 10;
      aces--;
    }
    
    return score;
  }
  
  return (
    <DealerContainer>
      <DealerTitle>
        Dealer
        {cards && cards.length > 0 && (
          <DealerScore $score={visibleScore}>{visibleScore}</DealerScore>
        )}
      </DealerTitle>
      
      <CardArea>
        {cards && cards.map((card, index) => {
          // Hide the second card if game is still in progress and not dealer's turn
          const isHidden = index === 1 && !showAllCards;
          return <Card key={index} card={card} hidden={isHidden} />;
        })}
        
        {cards && cards.length > 0 && showAllCards && (
          <ScoreChip $score={score}>{score}</ScoreChip>
        )}
      </CardArea>
      
      <DealerStatus>{getDealerStatus()}</DealerStatus>
    </DealerContainer>
  );
};

export default DealerArea; 