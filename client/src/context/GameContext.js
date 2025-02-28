import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(1000); // Start with $1000
  const [currentGame, setCurrentGame] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [dealer, setDealer] = useState({ cards: [], score: 0 });
  const [currentTurn, setCurrentTurn] = useState(null);
  const [gameState, setGameState] = useState('waiting'); // waiting, betting, playing, ended
  const [messages, setMessages] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  // Connect to socket server when component mounts
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Room events
    socket.on('room_joined', (data) => {
      setRoomId(data.roomId);
      setPlayers(data.players);
      setGameState(data.gameState);
    });

    socket.on('player_joined', (data) => {
      setPlayers(data.players);
    });

    socket.on('player_left', (data) => {
      setPlayers(data.players);
    });

    // Game events
    socket.on('game_started', (data) => {
      setCurrentGame(data.gameId);
      setDealer(data.dealer);
      setPlayers(data.players);
      setCurrentTurn(data.currentTurn);
      setGameState('betting');
    });

    socket.on('betting_ended', (data) => {
      setPlayers(data.players);
      setGameState('playing');
    });

    socket.on('player_turn', (data) => {
      setCurrentTurn(data.playerId);
    });

    socket.on('card_dealt', (data) => {
      if (data.to === 'dealer') {
        setDealer(data.dealer);
      } else {
        setPlayers(prev => prev.map(player => 
          player.id === data.to ? { ...player, cards: data.cards, score: data.score } : player
        ));
      }
    });

    socket.on('turn_ended', (data) => {
      setCurrentTurn(data.nextTurn);
      setPlayers(data.players);
    });

    socket.on('game_ended', (data) => {
      setDealer(data.dealer);
      setPlayers(data.players);
      setGameState('ended');
      setBalance(data.players.find(p => p.id === socket.id)?.balance || balance);
      setGameHistory(prev => [data.result, ...prev].slice(0, 10));
    });

    socket.on('new_round', (data) => {
      setDealer({ cards: [], score: 0 });
      setPlayers(data.players);
      setGameState('betting');
    });

    // Chat events
    socket.on('message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    // Leaderboard events
    socket.on('leaderboard_updated', (data) => {
      setLeaderboard(data.leaderboard);
    });

    return () => {
      socket.off('room_joined');
      socket.off('player_joined');
      socket.off('player_left');
      socket.off('game_started');
      socket.off('betting_ended');
      socket.off('player_turn');
      socket.off('card_dealt');
      socket.off('turn_ended');
      socket.off('game_ended');
      socket.off('new_round');
      socket.off('message');
      socket.off('leaderboard_updated');
    };
  }, [socket, balance]);

  // Game actions
  const createRoom = (username) => {
    if (!socket) return;
    setUser({ id: socket.id, username });
    socket.emit('create_room', { username, balance });
  };

  const joinRoom = (roomId, username) => {
    if (!socket) return;
    setUser({ id: socket.id, username });
    socket.emit('join_room', { roomId, username, balance });
  };

  const startGame = () => {
    if (!socket || !roomId) return;
    socket.emit('start_game', { roomId });
  };

  const placeBet = (amount) => {
    if (!socket || !roomId || gameState !== 'betting') return;
    socket.emit('place_bet', { roomId, amount });
  };

  const hitCard = () => {
    if (!socket || !roomId || currentTurn !== socket.id) return;
    socket.emit('hit', { roomId });
  };

  const stand = () => {
    if (!socket || !roomId || currentTurn !== socket.id) return;
    socket.emit('stand', { roomId });
  };

  const doubleDown = () => {
    if (!socket || !roomId || currentTurn !== socket.id) return;
    socket.emit('double_down', { roomId });
  };

  const split = () => {
    if (!socket || !roomId || currentTurn !== socket.id) return;
    socket.emit('split', { roomId });
  };

  const surrender = () => {
    if (!socket || !roomId || currentTurn !== socket.id) return;
    socket.emit('surrender', { roomId });
  };

  const sendMessage = (message) => {
    if (!socket || !roomId || !user) return;
    socket.emit('send_message', { roomId, message, sender: user.username });
  };

  const startNewRound = () => {
    if (!socket || !roomId) return;
    socket.emit('new_round', { roomId });
  };

  return (
    <GameContext.Provider
      value={{
        socket,
        user,
        balance,
        currentGame,
        roomId,
        players,
        dealer,
        currentTurn,
        gameState,
        messages,
        gameHistory,
        leaderboard,
        createRoom,
        joinRoom,
        startGame,
        placeBet,
        hitCard,
        stand,
        doubleDown,
        split,
        surrender,
        sendMessage,
        startNewRound
      }}
    >
      {children}
    </GameContext.Provider>
  );
}; 