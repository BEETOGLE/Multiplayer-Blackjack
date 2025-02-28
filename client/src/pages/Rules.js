import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const RulesContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
`;

const Card = styled.div`
  background-color: rgba(30, 30, 46, 0.8);
  border-radius: 10px;
  padding: 2rem;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #e2b714;
  text-align: center;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #e2b714;
  border-bottom: 1px solid #333;
  padding-bottom: 0.5rem;
`;

const List = styled.ul`
  margin-left: 1.5rem;
  margin-bottom: 1.5rem;
`;

const ListItem = styled.li`
  margin-bottom: 0.8rem;
  line-height: 1.5;
`;

const BackButton = styled.button`
  background-color: #2196f3;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 1rem;

  &:hover {
    background-color: #1e88e5;
    transform: translateY(-2px);
  }
`;

function Rules() {
  const navigate = useNavigate();

  return (
    <RulesContainer>
      <Card>
        <Title>📜 Blackjack Rules</Title>

        <Section>
          <SectionTitle>Game Objective</SectionTitle>
          <p>
            The goal of blackjack is to beat the dealer by having a hand value closer to 21 without going over.
            If your hand goes over 21, you "bust" and lose the bet automatically.
          </p>
        </Section>

        <Section>
          <SectionTitle>Card Values</SectionTitle>
          <List>
            <ListItem>
              <strong>Number cards (2-10):</strong> Worth their face value
            </ListItem>
            <ListItem>
              <strong>Face cards (Jack, Queen, King):</strong> Worth 10 points each
            </ListItem>
            <ListItem>
              <strong>Aces:</strong> Worth either 1 or 11 points, whichever is more favorable to the hand
            </ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>Dealer Rules</SectionTitle>
          <List>
            <ListItem>Dealer stands on all 17s (including "soft" 17s)</ListItem>
            <ListItem>Dealer's first card is dealt face down (hole card)</ListItem>
            <ListItem>Dealer's second card is dealt face up</ListItem>
            <ListItem>Dealer reveals hole card after all players have completed their turns</ListItem>
            <ListItem>Dealer must hit until reaching at least 17</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>Player Actions</SectionTitle>
          <List>
            <ListItem>
              <strong>Hit:</strong> Request another card to increase your hand value
            </ListItem>
            <ListItem>
              <strong>Stand:</strong> End your turn and keep your current hand value
            </ListItem>
            <ListItem>
              <strong>Double Down:</strong> Double your bet and receive exactly one more card
            </ListItem>
            <ListItem>
              <strong>Split:</strong> If you have two cards of the same value, you can split them into two separate hands (requires placing a bet equal to your original bet)
            </ListItem>
            <ListItem>
              <strong>Surrender:</strong> Give up your hand and lose only half your bet (only available as your first decision)
            </ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>Payouts</SectionTitle>
          <List>
            <ListItem>
              <strong>Blackjack (Ace + 10-value card):</strong> Pays 3:2
            </ListItem>
            <ListItem>
              <strong>Regular win:</strong> Pays 1:1 (even money)
            </ListItem>
            <ListItem>
              <strong>Insurance:</strong> Pays 2:1 (offered when dealer's up-card is an Ace)
            </ListItem>
            <ListItem>
              <strong>Push (tie):</strong> Bet is returned
            </ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>Game Progression</SectionTitle>
          <ol style={{ marginLeft: '1.5rem' }}>
            <ListItem>All players place their bets</ListItem>
            <ListItem>Dealer deals two cards to each player (face up) and two to themselves (one face up, one face down)</ListItem>
            <ListItem>Each player takes their turn, starting from the left of the dealer</ListItem>
            <ListItem>After all players complete their turns, dealer reveals their hole card</ListItem>
            <ListItem>Dealer draws cards according to the rules (must hit until 17 or higher)</ListItem>
            <ListItem>Bets are settled based on the results</ListItem>
          </ol>
        </Section>

        <BackButton onClick={() => navigate('/')}>
          ← Back to Lobby
        </BackButton>
      </Card>
    </RulesContainer>
  );
}

export default Rules; 