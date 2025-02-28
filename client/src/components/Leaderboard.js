import React from 'react';
import styled from 'styled-components';

const LeaderboardContainer = styled.div`
  background-color: rgba(30, 30, 46, 0.8);
  border-radius: 10px;
  padding: 1.5rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
`;

const Title = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #e2b714;
  text-align: center;
`;

const LeaderboardTable = styled.div`
  width: 100%;
`;

const LeaderboardHeader = styled.div`
  display: grid;
  grid-template-columns: 0.5fr 2fr 1fr;
  padding: 0.5rem;
  border-bottom: 1px solid #444;
  font-weight: bold;
  color: #aaa;
`;

const LeaderboardRow = styled.div`
  display: grid;
  grid-template-columns: 0.5fr 2fr 1fr;
  padding: 0.8rem 0.5rem;
  border-bottom: 1px solid #333;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const Rank = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: ${props => {
    if (props.rank === 1) return '#FFD700'; // Gold
    if (props.rank === 2) return '#C0C0C0'; // Silver
    if (props.rank === 3) return '#CD7F32'; // Bronze
    return '#f5f5f5';
  }};
`;

const Username = styled.div`
  font-weight: ${props => props.rank <= 3 ? 'bold' : 'normal'};
`;

const Balance = styled.div`
  text-align: right;
  font-weight: ${props => props.rank <= 3 ? 'bold' : 'normal'};
  color: ${props => props.rank <= 3 ? '#e2b714' : '#f5f5f5'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem 0;
  color: #888;
  font-style: italic;
`;

function Leaderboard({ leaderboard = [] }) {
  return (
    <LeaderboardContainer>
      <Title>🏆 Leaderboard</Title>
      
      <LeaderboardTable>
        <LeaderboardHeader>
          <div>#</div>
          <div>Player</div>
          <div>Balance</div>
        </LeaderboardHeader>
        
        {leaderboard.length > 0 ? (
          leaderboard.map((player, index) => (
            <LeaderboardRow key={player.id}>
              <Rank rank={index + 1}>{index + 1}</Rank>
              <Username rank={index + 1}>{player.username}</Username>
              <Balance rank={index + 1}>${player.balance.toLocaleString()}</Balance>
            </LeaderboardRow>
          ))
        ) : (
          <EmptyState>No players on the leaderboard yet.</EmptyState>
        )}
      </LeaderboardTable>
    </LeaderboardContainer>
  );
}

export default Leaderboard; 