import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useGame } from '../contexts/GameContext';

const JoinContainer = styled.div`
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 10px;
  padding: 30px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
`;

const Title = styled.h2`
  color: #e5c687;
  text-align: center;
  margin-bottom: 25px;
  font-size: 28px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  color: #e5c687;
  font-size: 16px;
`;

const Input = styled.input`
  padding: 12px;
  border-radius: 5px;
  border: 2px solid #144b2f;
  background-color: #0a2219;
  color: white;
  font-size: 16px;
  transition: border-color 0.3s;
  
  &:focus {
    outline: none;
    border-color: #e5c687;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
`;

const Button = styled.button`
  padding: 12px;
  border-radius: 5px;
  border: none;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.1s;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const CreateButton = styled(Button)`
  background-color: #e5c687;
  color: #0a2219;
  
  &:hover {
    background-color: #f0d498;
  }
`;

const JoinButton = styled(Button)`
  background-color: #144b2f;
  color: white;
  
  &:hover {
    background-color: #1a6340;
  }
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  text-align: center;
  margin-top: 15px;
  font-size: 14px;
`;

const JoinRoom = () => {
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [localError, setLocalError] = useState(null);
  const navigate = useNavigate();
  const { createRoom, joinRoom, error } = useGame();
  
  const handleCreateRoom = (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setLocalError('Please enter a username');
      return;
    }
    
    createRoom(username);
    // Don't navigate immediately, wait for room_joined event in GameContext
  };
  
  const handleJoinRoom = (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setLocalError('Please enter a username');
      return;
    }
    
    if (!roomCode.trim()) {
      setLocalError('Please enter a room code');
      return;
    }
    
    joinRoom(roomCode.toUpperCase(), username);
    // Don't navigate immediately, wait for room_joined event in GameContext
  };
  
  return (
    <JoinContainer>
      <Title>Multiplayer Blackjack</Title>
      <Form>
        <InputGroup>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            maxLength={15}
          />
        </InputGroup>
        
        <InputGroup>
          <Label htmlFor="roomCode">Room Code (for joining)</Label>
          <Input
            id="roomCode"
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="Enter room code to join"
            maxLength={6}
          />
        </InputGroup>
        
        <ButtonGroup>
          <CreateButton onClick={handleCreateRoom}>Create New Room</CreateButton>
          <JoinButton onClick={handleJoinRoom}>Join Room</JoinButton>
        </ButtonGroup>
        
        {(localError || error) && (
          <ErrorMessage>{localError || error}</ErrorMessage>
        )}
      </Form>
    </JoinContainer>
  );
};

export default JoinRoom; 