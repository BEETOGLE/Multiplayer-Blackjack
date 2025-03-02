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
  const [gameHistory, setGameHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [lastBet, setLastBet] = useState(0);
  const [hintsEnabled, setHintsEnabled] = useState(true);
  const [autoSkipNewRound, setAutoSkipNewRound] = useState(true);
  const navigate = useNavigate();

  // Helper function to add messages to the chat
  const addMessage = (message) => {
    setMessages(prevMessages => [...prevMessages, message]);
  };

  // Define startNewRound function before it's used in useEffect
  const startNewRound = () => {
    if (!connected) {
      console.error("Cannot start new round: Not connected to server");
      return;
    }
    
    if (!roomId) {
      console.error("Cannot start new round: No room ID");
      return;
    }
    
    if (!socket) {
      console.error("Cannot start new round: Socket not initialized");
      return;
    }
    
    console.log(`Emitting new_round event for room ${roomId}`);
    socket.emit('new_round', { roomId });
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
      if (!data) return;
      setGameState('ended');
      setDealer(data.dealer || { cards: [], score: 0 });
      setPlayers(data.players || []);
      setCurrentTurn(null);
      
      // Update game history
      const historyEntry = {
        id: Date.now(),
        dealer: data.dealer,
        players: data.players,
        results: data.result?.results || [],
        timestamp: Date.now()
      };
      setGameHistory(prev => [historyEntry, ...prev].slice(0, 10));
      
      // Add system message
      let resultMessage = 'Round ended. Check your results!';
      if (data.result && data.result.results) {
        const resultSummary = data.result.results
          .map(r => `${r.username}: ${r.outcome} (${r.amountChange >= 0 ? '+' : ''}${r.amountChange})`)
          .join(', ');
        resultMessage = `Round ended. Results: ${resultSummary}`;
      }
      
      addMessage({
        content: resultMessage,
        type: 'system',
        timestamp: Date.now()
      });
      
      // If host has auto-next round enabled, automatically start a new round immediately
      if (autoSkipNewRound && socket.id === players[0]?.id) {
        console.log("Auto next round enabled, starting new round immediately");
        console.log("Current socket ID:", socket.id);
        console.log("Host ID (players[0].id):", players[0]?.id);
        console.log("autoSkipNewRound value:", autoSkipNewRound);
        startNewRound();
      } else {
        console.log("Auto next round not triggered because:");
        console.log("- autoSkipNewRound:", autoSkipNewRound);
        console.log("- Is current player the host:", socket.id === players[0]?.id);
        console.log("- Current socket ID:", socket.id);
        console.log("- Host ID (players[0].id):", players[0]?.id);
      }
    });
    
    socket.on('new_round', (data) => {
      if (!data) return;
      setGameState('betting');
      setPlayers(data.players || []);
      setDealer(data.dealer || { cards: [], score: 0 });
      
      // Add system message
      // Only mention manual start if auto-skip is disabled
      const manualStartMessage = data.isAutoSkip === false ? ' (Manual start by host)' : '';
      addMessage({
        content: `New round started${manualStartMessage}. Place your bets!`,
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
    
    // Handle player spectating event
    socket.on('player_spectating', (data) => {
      if (!data) return;
      
      // Update the player's status in the players array
      setPlayers(prev => 
        prev.map(player => 
          player.id === data.playerId 
            ? { ...player, status: 'spectating' } 
            : player
        )
      );
      
      addMessage({
        content: `${data.username} is now spectating the game`,
        type: 'system',
        timestamp: Date.now()
      });
      
      console.log(`Player ${data.username} is now spectating`);
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
      socket.off('player_spectating');
    };
  }, [socket, autoSkipNewRound, players, startNewRound]);
  
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
    setLastBet(amount);
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
  
  // Toggle hints
  const toggleHints = () => {
    setHintsEnabled(prev => !prev);
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
        gameHistory,
        leaderboard,
        lastBet,
        hintsEnabled,
        autoSkipNewRound,
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
        getCurrentPlayer,
        toggleHints,
        setAutoSkipNewRound
      }}
    >
      {children}
    </GameContext.Provider>
  );
}; 