import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useGame } from '../contexts/GameContext';

const LeaderboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)), 
              url('/images/background.jpg') no-repeat center center/cover;
`;

const PageTitle = styled.h1`
  font-size: 36px;
  color: #e5c687;
  margin-bottom: 30px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  text-align: center;
`;

const LeaderboardCard = styled.div`
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 10px;
  padding: 30px;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  margin-bottom: 30px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  color: white;
`;

const TableHeader = styled.th`
  padding: 15px;
  text-align: left;
  border-bottom: 2px solid #e5c687;
  color: #e5c687;
  font-size: 18px;
`;

const TableRow = styled.tr`
  &:nth-child(odd) {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  &:hover {
    background-color: rgba(229, 198, 135, 0.1);
  }
`;

const TableCell = styled.td`
  padding: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const RankCell = styled(TableCell)`
  font-weight: bold;
  width: 60px;
`;

const BalanceCell = styled(TableCell)`
  color: #4caf50;
  font-weight: bold;
  text-align: right;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 0;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
`;

const BackButton = styled(Link)`
  display: inline-block;
  padding: 12px 25px;
  background-color: #144b2f;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-weight: bold;
  transition: background-color 0.3s, transform 0.1s;
  
  &:hover {
    background-color: #1a6340;
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const Leaderboard = () => {
  const { leaderboard } = useGame();
  
  // To format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <LeaderboardContainer>
      <PageTitle>Blackjack Leaderboard</PageTitle>
      
      <LeaderboardCard>
        {leaderboard && leaderboard.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <TableHeader>Rank</TableHeader>
                <TableHeader>Player</TableHeader>
                <TableHeader style={{ textAlign: 'right' }}>Balance</TableHeader>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((player, index) => (
                <TableRow key={player.id}>
                  <RankCell>#{index + 1}</RankCell>
                  <TableCell>{player.username}</TableCell>
                  <BalanceCell>{formatCurrency(player.balance)}</BalanceCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState>
            No players on the leaderboard yet. Start playing to see rankings!
          </EmptyState>
        )}
      </LeaderboardCard>
      
      <BackButton to="/">Back to Home</BackButton>
    </LeaderboardContainer>
  );
};

export default Leaderboard; 