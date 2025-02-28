import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import JoinRoom from '../components/JoinRoom';

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)), 
              url('/images/background.jpg') no-repeat center center/cover;
  padding: 0 20px;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 48px;
  color: #e5c687;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: white;
  opacity: 0.9;
`;

const Links = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 30px;
`;

const NavLink = styled(Link)`
  color: #e5c687;
  text-decoration: none;
  padding: 10px 15px;
  border: 1px solid #e5c687;
  border-radius: 5px;
  transition: all 0.3s;
  
  &:hover {
    background-color: #e5c687;
    color: #0a2219;
  }
`;

const Footer = styled.footer`
  position: absolute;
  bottom: 20px;
  color: white;
  opacity: 0.7;
  font-size: 14px;
`;

const Home = () => {
  return (
    <HomeContainer>
      <Header>
        <Title>Blackjack Multiplayer</Title>
        <Subtitle>Play with friends and compete in real-time</Subtitle>
      </Header>
      
      <JoinRoom />
      
      <Links>
        <NavLink to="/rules">Game Rules</NavLink>
        <NavLink to="/leaderboard">Leaderboard</NavLink>
      </Links>
      
      <Footer>© 2023 Blackjack Multiplayer - All Rights Reserved</Footer>
    </HomeContainer>
  );
};

export default Home; 