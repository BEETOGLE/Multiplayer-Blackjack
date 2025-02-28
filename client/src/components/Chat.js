import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useGame } from '../contexts/GameContext';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 50%;
  border-bottom: 1px solid #333;
`;

const ChatHeader = styled.div`
  padding: 12px;
  font-weight: 600;
  color: #e2b714;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
  }
`;

const MessagesContainer = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #1e1e2e;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #444;
  }
`;

const MessageBubble = styled.div`
  padding: 8px 12px;
  border-radius: 12px;
  max-width: 80%;
  word-wrap: break-word;
  
  ${props => props.type === 'system' && `
    align-self: center;
    background-color: rgba(46, 46, 46, 0.7);
    color: #aaa;
    font-style: italic;
    font-size: 0.9rem;
    max-width: 100%;
    text-align: center;
  `}
  
  ${props => props.type === 'message' && `
    align-self: ${props.isMine ? 'flex-end' : 'flex-start'};
    background-color: ${props.isMine ? '#1A6340' : '#2C2C44'};
    color: white;
  `}
`;

const MessageSender = styled.div`
  font-weight: 600;
  font-size: 0.8rem;
  margin-bottom: 2px;
  color: ${props => props.isMine ? '#90EE90' : '#e2b714'};
`;

const MessageTime = styled.span`
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
  margin-left: 8px;
`;

const InputContainer = styled.form`
  display: flex;
  padding: 10px;
  background-color: #1E1E2E;
`;

const ChatInput = styled.input`
  flex-grow: 1;
  padding: 10px 12px;
  border-radius: 4px;
  border: 1px solid #333;
  background-color: #16162B;
  color: white;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #e2b714;
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const SendButton = styled.button`
  background-color: #1A6340;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0 15px;
  margin-left: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #144B2F;
  }
  
  &:disabled {
    background-color: #333;
    cursor: not-allowed;
  }
`;

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const Chat = () => {
  const { messages, sendMessage, username } = useGame();
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!messageInput.trim()) return;
    
    sendMessage(messageInput);
    setMessageInput('');
  };
  
  return (
    <ChatContainer>
      <ChatHeader>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M6,9H18V11H6M14,14H6V12H14M18,8H6V6H18"></path>
        </svg>
        Game Chat
      </ChatHeader>
      
      <MessagesContainer>
        {messages.map((message, index) => (
          <MessageBubble 
            key={index} 
            type={message.type} 
            isMine={message.sender === username}
          >
            {message.type === 'message' && (
              <MessageSender isMine={message.sender === username}>
                {message.sender}
                <MessageTime>{formatTime(message.timestamp)}</MessageTime>
              </MessageSender>
            )}
            {message.content}
          </MessageBubble>
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      
      <InputContainer onSubmit={handleSubmit}>
        <ChatInput 
          type="text" 
          placeholder="Type a message..." 
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
        />
        <SendButton type="submit" disabled={!messageInput.trim()}>
          Send
        </SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default Chat; 