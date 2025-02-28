import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { SOCKET_SERVER } from '../config';

export const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState('');
  const [balance, setBalance] = useState(1000);
  const [roomId, setRoomId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [dealer, setDealer] = useState({ cards: [], score: 0 });
  const [gameState, setGameState] = useState('waiting');
  const [currentTurn, setCurrentTurn] = useState(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const navigate = useNavigate();

  // Helper function to add messages to the chat
  const addMessage = (message) => {
    setMessages(prevMessages => [...prevMessages, message]);
  };

  // Connect to socket server
  useEffect(() => {
    const newSocket = io(SOCKET_SERVER);
    
    newSocket.on('connect', () => {
      setSocket(newSocket);
      setConnected(true);
      console.log('Connected to server');
    });
    
    newSocket.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from server');
    });
    
    newSocket.on('error', (data) => {
      setError(data.message);
      setTimeout(() => setError(null), 5000);
    });
    
    return () => {
      newSocket.disconnect();
    };
  }, []);
  
  // Handle room events
  useEffect(() => {
    if (!socket) return;
    
    socket.on('room_joined', (data) => {
      if (!data) return;
      setRoomId(data.roomId);
      setPlayers(data.players || []);
      setGameState(data.gameState || 'waiting');
      setError(null);
      
      // Add system message
      const playerNames = data.players ? data.players.map(p => p.username).join(', ') : '';
      addMessage({
        content: `Room joined. Current players: ${playerNames}`,
        type: 'system',
        timestamp: Date.now()
      });

      // Navigate to game room after successful join
      navigate('/game-room');
    });
    
    socket.on('player_joined', (data) => {
      if (!data || !data.players) return;
      setPlayers(data.players);
      
      // Add system message about new player
      const newPlayer = data.players[data.players.length - 1];
      if (newPlayer) {
        addMessage({
          content: `${newPlayer.username} joined the room`,
          type: 'system',
          timestamp: Date.now()
        });
      }
    });
    
    socket.on('player_left', (data) => {
      if (!data) return;
      setPlayers(data.players || []);
      
      // Add system message about player leaving
      if (data.leftPlayer) {
        addMessage({
          content: `${data.leftPlayer} left the room`,
          type: 'system',
          timestamp: Date.now()
        });
      }
    });
    
    return () => {
      socket.off('room_joined');
      socket.off('player_joined');
      socket.off('player_left');
    };
  }, [socket, navigate]);
  
  // Handle game events
  useEffect(() => {
    if (!socket) return;
    
    socket.on('game_started', (data) => {
      if (!data) return;
      setGameState('betting');
      setDealer(data.dealer || { cards: [], score: 0 });
      setPlayers(data.players || []);
      
      addMessage({
        content: 'Game started! Place your bets.',
        type: 'system',
        timestamp: Date.now()
      });
    });
    
    socket.on('betting_ended', (data) => {
      if (!data) return;
      setPlayers(data.players || []);
      setGameState('playing');
      
      addMessage({
        content: 'All bets placed. Game is starting...',
        type: 'system',
        timestamp: Date.now()
      });
    });
    
    socket.on('player_turn', (data) => {
      setCurrentTurn(data.playerId);
      
      const player = data.players && data.players.find(p => p.id === data.playerId);
      
      addMessage({
        content: `It's ${player ? player.username : 'unknown player'}'s turn`,
        type: 'system',
        timestamp: Date.now()
      });
    });
    
    socket.on('card_dealt', (data) => {
      if (!data) return;
      if (data.to === 'dealer') {
        setDealer(data.dealer || { cards: [], score: 0 });
      } else if (data.to && data.cards) {
        setPlayers(prev => 
          prev.map(player => 
            player.id === data.to ? { ...player, cards: data.cards, score: data.score || 0 } : player
          )
        );
      }
    });
    
    socket.on('turn_ended', (data) => {
      if (!data) return;
      setCurrentTurn(data.nextTurn);
      setPlayers(data.players || []);
    });
    
    socket.on('dealer_turn', () => {
      setCurrentTurn('dealer');
      
      addMessage({
        content: `Dealer's turn`,
        type: 'system',
        timestamp: Date.now()
      });
    });
    
    socket.on('game_ended', (data) => {
      setGameState('ended');
      setDealer(data.dealer);
      setPlayers(data.players || []);
      setCurrentTurn(null);
      
      // Update the player's balance
      const currentPlayer = data.players && data.players.find(p => p.id === socket.id);
      if (currentPlayer) {
        setBalance(currentPlayer.balance);
      }
      
      // Add system message
      addMessage({
        content: `Game ended. Results: ${data.result && data.result.results
          ? data.result.results
              .map(r => `${r.username}: ${r.outcome} (${r.amountChange >= 0 ? '+' : ''}${r.amountChange})`)
              .join(', ')
          : 'No results available'}`,
        type: 'system',
        timestamp: Date.now()
      });
    });
    
    socket.on('new_round', (data) => {
      if (!data) return;
      setGameState('betting');
      setPlayers(data.players || []);
      setDealer({ cards: [], score: 0 });
      
      addMessage({
        content: 'New round started. Place your bets!',
        type: 'system',
        timestamp: Date.now()
      });
    });
    
    socket.on('message', (data) => {
      addMessage(data);
    });
    
    socket.on('leaderboard_updated', (data) => {
      setLeaderboard(data.leaderboard);
    });
    
    socket.on('player_split', (data) => {
      if (!data) return;
      setPlayers(data.players || []);
      
      addMessage({
        content: `${data.players.find(p => p.id === data.playerId)?.username || 'Player'} split their hand`,
        type: 'system',
        timestamp: Date.now()
      });
    });
    
    return () => {
      socket.off('game_started');
      socket.off('betting_ended');
      socket.off('card_dealt');
      socket.off('player_turn');
      socket.off('turn_ended');
      socket.off('dealer_turn');
      socket.off('game_ended');
      socket.off('new_round');
      socket.off('message');
      socket.off('leaderboard_updated');
      socket.off('player_split');
    };
  }, [socket]);
  
  // Game actions
  const createRoom = (username, initialBalance = 1000) => {
    if (!connected) return;
    
    setUsername(username);
    setBalance(initialBalance);
    socket.emit('create_room', { username, balance: initialBalance });
  };
  
  const joinRoom = (roomId, username, initialBalance = 1000) => {
    if (!connected) return;
    
    setUsername(username);
    setBalance(initialBalance);
    socket.emit('join_room', { roomId, username, balance: initialBalance });
  };
  
  const startGame = () => {
    if (!connected || !roomId) return;
    
    socket.emit('start_game', { roomId });
  };
  
  const placeBet = (amount) => {
    if (!connected || !roomId) return;
    
    socket.emit('place_bet', { roomId, amount });
  };
  
  const hit = () => {
    if (!connected || !roomId) return;
    
    // For split hands, we need to use the original player's socket ID
    if (currentTurn && currentTurn.includes('-split')) {
      const originalPlayerId = currentTurn.split('-')[0];
      if (originalPlayerId === socket.id) {
        socket.emit('hit', { roomId, handId: currentTurn });
      }
    } else if (currentTurn === socket.id) {
      socket.emit('hit', { roomId });
    }
  };
  
  const stand = () => {
    if (!connected || !roomId) return;
    
    // For split hands, we need to use the original player's socket ID
    if (currentTurn && currentTurn.includes('-split')) {
      const originalPlayerId = currentTurn.split('-')[0];
      if (originalPlayerId === socket.id) {
        socket.emit('stand', { roomId, handId: currentTurn });
      }
    } else if (currentTurn === socket.id) {
      socket.emit('stand', { roomId });
    }
  };
  
  const doubleDown = () => {
    if (!connected || !roomId) return;
    
    // For split hands, we need to use the original player's socket ID
    if (currentTurn && currentTurn.includes('-split')) {
      const originalPlayerId = currentTurn.split('-')[0];
      if (originalPlayerId === socket.id) {
        socket.emit('double_down', { roomId, handId: currentTurn });
      }
    } else if (currentTurn === socket.id) {
      socket.emit('double_down', { roomId });
    }
  };
  
  const split = () => {
    if (!connected || !roomId || currentTurn !== socket.id) return;
    
    // Can't split a split hand
    if (currentTurn.includes('-split')) return;
    
    socket.emit('split', { roomId });
  };
  
  const surrender = () => {
    if (!connected || !roomId) return;
    
    // For split hands, we need to use the original player's socket ID
    if (currentTurn && currentTurn.includes('-split')) {
      const originalPlayerId = currentTurn.split('-')[0];
      if (originalPlayerId === socket.id) {
        socket.emit('surrender', { roomId, handId: currentTurn });
      }
    } else if (currentTurn === socket.id) {
      socket.emit('surrender', { roomId });
    }
  };
  
  const startNewRound = () => {
    if (!connected || !roomId) return;
    
    socket.emit('new_round', { roomId });
  };
  
  const sendMessage = (message) => {
    if (!connected || !roomId) return;
    
    socket.emit('send_message', { roomId, message, sender: username });
  };
  
  const leaveRoom = () => {
    if (!connected || !roomId) return;
    
    socket.emit('leave_room', { roomId });
    setRoomId(null);
    setPlayers([]);
    setDealer({ cards: [], score: 0 });
    setGameState('waiting');
    setCurrentTurn(null);
    setMessages([]);
  };
  
  // Check if it's current player's turn
  const isPlayerTurn = () => {
    if (!socket || !currentTurn) return false;
    
    // Direct match with player's socket ID
    if (currentTurn === socket.id) return true;
    
    // Check if it's the player's split hand turn
    // Split hands have IDs in the format: originalPlayerId-split
    if (currentTurn.includes('-split')) {
      const originalPlayerId = currentTurn.split('-')[0];
      return originalPlayerId === socket.id;
    }
    
    return false;
  };
  
  // Find the current player
  const getCurrentPlayer = () => {
    if (!socket || !players) return null;
    
    // First check for the player's main hand
    const player = players.find(p => p.id === socket.id);
    
    // If it's the player's split hand turn, return that hand instead
    if (currentTurn && currentTurn.includes('-split')) {
      const splitHand = players.find(p => p.id === currentTurn);
      if (splitHand && splitHand.originalPlayer === socket.id) {
        return splitHand;
      }
    }
    
    return player;
  };
  
  return (
    <GameContext.Provider
      value={{
        connected,
        username,
        balance,
        roomId,
        players,
        dealer,
        gameState,
        currentTurn,
        messages,
        error,
        leaderboard,
        createRoom,
        joinRoom,
        startGame,
        placeBet,
        hit,
        stand,
        doubleDown,
        split,
        surrender,
        startNewRound,
        sendMessage,
        leaveRoom,
        isPlayerTurn,
        getCurrentPlayer
      }}
    >
      {children}
    </GameContext.Provider>
  );
}; 