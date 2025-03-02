const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Game state
const rooms = {};
const leaderboard = [];

// Card deck utilities
const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];

// Create a new deck of cards
const createDeck = () => {
  const deck = [];
  for (const suit of suits) {
    for (const value of values) {
      deck.push({ suit, value });
    }
  }
  return deck;
};

// Shuffle a deck of cards
const shuffleDeck = (deck) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

// Calculate the best score for a hand (handling aces)
const calculateHandValue = (cards) => {
  let score = 0;
  let aces = 0;
  
  // Count score and aces
  for (const card of cards) {
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
};

// Check for blackjack (21 with exactly 2 cards)
const isBlackjack = (cards) => {
  return cards.length === 2 && calculateHandValue(cards) === 21;
};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Create a new room
  socket.on('create_room', ({ username, balance }) => {
    const roomId = uuidv4().substring(0, 6).toUpperCase();
    
    rooms[roomId] = {
      id: roomId,
      players: [{
        id: socket.id,
        username,
        balance,
        cards: [],
        bet: 0,
        status: null,
        score: 0,
        hasCrown: false
      }],
      dealer: {
        cards: [],
        score: 0
      },
      gameState: 'waiting',
      deck: [],
      currentTurn: null
    };
    
    socket.join(roomId);
    socket.emit('room_joined', {
      roomId,
      players: rooms[roomId].players,
      gameState: 'waiting'
    });
    
    console.log(`Room created: ${roomId} by ${username}`);
  });
  
  // Join an existing room
  socket.on('join_room', ({ roomId, username, balance }) => {
    // Check if room exists
    if (!rooms[roomId]) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    // Check if game is in progress
    if (rooms[roomId].gameState !== 'waiting') {
      socket.emit('error', { message: 'Game already in progress' });
      return;
    }
    
    // Add player to room
    const player = {
      id: socket.id,
      username,
      balance,
      cards: [],
      bet: 0,
      status: null,
      score: 0
    };
    
    rooms[roomId].players.push(player);
    
    socket.join(roomId);
    
    // Notify player they've joined
    socket.emit('room_joined', {
      roomId,
      players: rooms[roomId].players,
      gameState: 'waiting'
    });
    
    // Notify others in the room
    socket.to(roomId).emit('player_joined', {
      players: rooms[roomId].players
    });
    
    console.log(`Player ${username} joined room ${roomId}`);
  });
  
  // Start the game
  socket.on('start_game', ({ roomId }) => {
    if (!rooms[roomId]) return;
    
    // Check if player is the host (first player)
    if (rooms[roomId].players[0].id !== socket.id) {
      socket.emit('error', { message: 'Only the host can start the game' });
      return;
    }
    
    // Need at least 2 players
    if (rooms[roomId].players.length < 2) {
      socket.emit('error', { message: 'Need at least 2 players to start' });
      return;
    }
    
    // Create and shuffle deck
    rooms[roomId].deck = shuffleDeck(createDeck());
    rooms[roomId].gameState = 'betting';
    
    // Emit game started event to all players in room
    io.to(roomId).emit('game_started', {
      gameId: uuidv4(),
      players: rooms[roomId].players,
      dealer: rooms[roomId].dealer,
      currentTurn: null
    });
    
    console.log(`Game started in room ${roomId}`);
  });
  
  // Place a bet
  socket.on('place_bet', ({ roomId, amount }) => {
    if (!rooms[roomId] || rooms[roomId].gameState !== 'betting') return;
    
    // Find the player
    const playerIndex = rooms[roomId].players.findIndex(p => p.id === socket.id);
    if (playerIndex === -1) return;
    
    const player = rooms[roomId].players[playerIndex];
    
    // Validate bet amount
    if (amount <= 0 || amount > player.balance) {
      socket.emit('error', { message: 'Invalid bet amount' });
      return;
    }
    
    // Update player's bet
    player.bet = amount;
    player.balance -= amount;
    rooms[roomId].players[playerIndex] = player;
    
    // Emit to the player that their bet was placed successfully
    socket.emit('bet_placed', {
      bet: amount,
      balance: player.balance
    });
    
    // Check if all players have placed bets or have zero balance
    const allPlayersReady = rooms[roomId].players.every(p => 
      p.bet > 0 || p.balance === 0
    );
    
    if (allPlayersReady) {
      // Deal initial cards
      dealInitialCards(roomId);
      
      // Update game state
      rooms[roomId].gameState = 'playing';
      
      // Emit betting ended event
      io.to(roomId).emit('betting_ended', {
        players: rooms[roomId].players
      });
      
      // Emit dealer cards
      io.to(roomId).emit('card_dealt', {
        to: 'dealer',
        dealer: rooms[roomId].dealer
      });
    }
  });
  
  // Hit (draw a card)
  socket.on('hit', ({ roomId, handId }) => {
    if (!rooms[roomId] || rooms[roomId].gameState !== 'playing') return;
    
    // Determine which hand ID to use
    const targetHandId = handId || socket.id;
    
    // Check if it's player's turn
    if (rooms[roomId].currentTurn !== targetHandId) {
      socket.emit('error', { message: 'Not your turn' });
      return;
    }
    
    // Find the player or split hand
    const playerIndex = rooms[roomId].players.findIndex(p => p.id === targetHandId);
    if (playerIndex === -1) return;
    
    const player = rooms[roomId].players[playerIndex];
    
    // Deal a card to the player
    const card = rooms[roomId].deck.pop();
    player.cards.push(card);
    
    // Calculate new score
    player.score = calculateHandValue(player.cards);
    
    // Check if player busted
    if (player.score > 21) {
      player.status = 'busted';
      
      // Update player in room
      rooms[roomId].players[playerIndex] = player;
      
      // Emit card dealt event
      io.to(roomId).emit('card_dealt', {
        to: player.id,
        cards: player.cards,
        score: player.score
      });
      
      // Move to next player's turn
      nextPlayerTurn(roomId);
    } else {
      // Update player in room
      rooms[roomId].players[playerIndex] = player;
      
      // Emit card dealt event
      io.to(roomId).emit('card_dealt', {
        to: player.id,
        cards: player.cards,
        score: player.score
      });
    }
  });
  
  // Stand (end turn)
  socket.on('stand', ({ roomId, handId }) => {
    if (!rooms[roomId] || rooms[roomId].gameState !== 'playing') return;
    
    // Determine which hand ID to use
    const targetHandId = handId || socket.id;
    
    // Check if it's player's turn
    if (rooms[roomId].currentTurn !== targetHandId) {
      socket.emit('error', { message: 'Not your turn' });
      return;
    }
    
    // Find the player or split hand
    const playerIndex = rooms[roomId].players.findIndex(p => p.id === targetHandId);
    if (playerIndex === -1) return;
    
    const player = rooms[roomId].players[playerIndex];
    player.status = 'stood';
    
    // Update player in room
    rooms[roomId].players[playerIndex] = player;
    
    // Move to next player's turn
    nextPlayerTurn(roomId);
  });
  
  // Double down
  socket.on('double_down', ({ roomId, handId }) => {
    if (!rooms[roomId] || rooms[roomId].gameState !== 'playing') return;
    
    // Determine which hand ID to use
    const targetHandId = handId || socket.id;
    
    // Check if it's player's turn
    if (rooms[roomId].currentTurn !== targetHandId) {
      socket.emit('error', { message: 'Not your turn' });
      return;
    }
    
    // Find the player or split hand
    const playerIndex = rooms[roomId].players.findIndex(p => p.id === targetHandId);
    if (playerIndex === -1) return;
    
    const player = rooms[roomId].players[playerIndex];
    
    // Check if player has only 2 cards (first action)
    if (player.cards.length !== 2) {
      socket.emit('error', { message: 'Can only double down on first action' });
      return;
    }
    
    // For split hands, use the original player's balance
    let originalPlayer = player;
    if (player.originalPlayer) {
      const originalPlayerIndex = rooms[roomId].players.findIndex(p => p.id === player.originalPlayer);
      if (originalPlayerIndex !== -1) {
        originalPlayer = rooms[roomId].players[originalPlayerIndex];
      }
    }
    
    // Check if player has enough balance
    if (originalPlayer.balance < player.bet) {
      socket.emit('error', { message: 'Not enough balance to double down' });
      return;
    }
    
    // Double the bet
    originalPlayer.balance -= player.bet;
    player.bet *= 2;
    
    // Deal one more card
    const card = rooms[roomId].deck.pop();
    player.cards.push(card);
    
    // Calculate new score
    player.score = calculateHandValue(player.cards);
    
    // Set status based on score
    if (player.score > 21) {
      player.status = 'busted';
    } else {
      player.status = 'stood';
    }
    
    // Update player in room
    rooms[roomId].players[playerIndex] = player;
    
    // If we updated the original player's balance, update that too
    if (player.originalPlayer) {
      const originalPlayerIndex = rooms[roomId].players.findIndex(p => p.id === player.originalPlayer);
      if (originalPlayerIndex !== -1) {
        rooms[roomId].players[originalPlayerIndex] = originalPlayer;
      }
    }
    
    // Emit card dealt event
    io.to(roomId).emit('card_dealt', {
      to: player.id,
      cards: player.cards,
      score: player.score
    });
    
    // Move to next player's turn
    nextPlayerTurn(roomId);
  });
  
  // Split
  socket.on('split', ({ roomId }) => {
    if (!rooms[roomId] || rooms[roomId].gameState !== 'playing') return;
    
    // Check if it's player's turn
    if (rooms[roomId].currentTurn !== socket.id) {
      socket.emit('error', { message: 'Not your turn' });
      return;
    }
    
    // Find the player
    const playerIndex = rooms[roomId].players.findIndex(p => p.id === socket.id);
    if (playerIndex === -1) return;
    
    const player = rooms[roomId].players[playerIndex];
    
    // Check if player has exactly 2 cards
    if (player.cards.length !== 2) {
      socket.emit('error', { message: 'Can only split with 2 cards' });
      return;
    }
    
    // Check if cards have the same value
    if (player.cards[0].value !== player.cards[1].value) {
      socket.emit('error', { message: 'Can only split matching cards' });
      return;
    }
    
    // Check if player has enough balance for the additional bet
    if (player.balance < player.bet) {
      socket.emit('error', { message: 'Not enough balance to split' });
      return;
    }
    
    // Create a new hand for the player
    const newHand = {
      id: `${player.id}-split`,
      username: `${player.username} (Split)`,
      balance: player.balance - player.bet,
      cards: [player.cards[1], rooms[roomId].deck.pop()],
      bet: player.bet,
      status: null,
      score: 0,
      originalPlayer: player.id
    };
    
    // Update the original hand
    player.cards = [player.cards[0], rooms[roomId].deck.pop()];
    player.balance -= player.bet;
    
    // Calculate scores for both hands
    player.score = calculateHandValue(player.cards);
    newHand.score = calculateHandValue(newHand.cards);
    
    // Check for blackjack in either hand
    if (isBlackjack(player.cards)) {
      player.status = 'blackjack';
    }
    
    if (isBlackjack(newHand.cards)) {
      newHand.status = 'blackjack';
    }
    
    // Update player in room
    rooms[roomId].players[playerIndex] = player;
    
    // Add the new hand to the players array
    rooms[roomId].players.push(newHand);
    
    // Emit card dealt events for both hands
    io.to(roomId).emit('card_dealt', {
      to: player.id,
      cards: player.cards,
      score: player.score
    });
    
    io.to(roomId).emit('card_dealt', {
      to: newHand.id,
      cards: newHand.cards,
      score: newHand.score
    });
    
    // Emit player split event
    io.to(roomId).emit('player_split', {
      playerId: player.id,
      newHandId: newHand.id,
      players: rooms[roomId].players
    });
    
    // If the first hand has blackjack, move to the next hand or player
    if (player.status === 'blackjack') {
      nextPlayerTurn(roomId);
    }
  });
  
  // Surrender
  socket.on('surrender', ({ roomId, handId }) => {
    if (!rooms[roomId] || rooms[roomId].gameState !== 'playing') return;
    
    // Determine which hand ID to use
    const targetHandId = handId || socket.id;
    
    // Check if it's player's turn
    if (rooms[roomId].currentTurn !== targetHandId) {
      socket.emit('error', { message: 'Not your turn' });
      return;
    }
    
    // Find the player or split hand
    const playerIndex = rooms[roomId].players.findIndex(p => p.id === targetHandId);
    if (playerIndex === -1) return;
    
    const player = rooms[roomId].players[playerIndex];
    
    // Check if player has only 2 cards (first action)
    if (player.cards.length !== 2) {
      socket.emit('error', { message: 'Can only surrender on first action' });
      return;
    }
    
    // Player gets half their bet back
    // For split hands, update the original player's balance
    if (player.originalPlayer) {
      const originalPlayerIndex = rooms[roomId].players.findIndex(p => p.id === player.originalPlayer);
      if (originalPlayerIndex !== -1) {
        rooms[roomId].players[originalPlayerIndex].balance += player.bet / 2;
      }
    } else {
      player.balance += player.bet / 2;
    }
    
    player.bet /= 2;
    player.status = 'surrendered';
    
    // Update player in room
    rooms[roomId].players[playerIndex] = player;
    
    // Move to next player's turn
    nextPlayerTurn(roomId);
  });
  
  // Start a new round
  socket.on('new_round', ({ roomId }) => {
    console.log(`Received new_round event for room ${roomId} from socket ${socket.id}`);
    
    if (!rooms[roomId]) {
      console.log(`Room ${roomId} not found for new_round event`);
      return;
    }
    
    if (rooms[roomId].gameState !== 'ended') {
      console.log(`Cannot start new round in room ${roomId} - game state is ${rooms[roomId].gameState}`);
      return;
    }
    
    // Check if the request is from the host (first player)
    const isHost = rooms[roomId].players.length > 0 && rooms[roomId].players[0].id === socket.id;
    console.log(`New round requested by ${socket.id}, isHost: ${isHost}, first player: ${rooms[roomId].players[0]?.id}`);
    
    // Check if the host has zero balance
    const hostHasZeroBalance = rooms[roomId].players.length > 0 && 
                              rooms[roomId].players[0].balance <= 0;
    
    if (hostHasZeroBalance) {
      console.log(`Host ${rooms[roomId].players[0].username} has zero balance and will be marked as spectating`);
    }
    
    // Reset game state
    rooms[roomId].deck = shuffleDeck(createDeck());
    rooms[roomId].dealer = {
      cards: [],
      score: 0,
      status: null
    };
    
    // Reset player cards, bets, status
    for (let i = 0; i < rooms[roomId].players.length; i++) {
      // Remove split hands
      if (rooms[roomId].players[i].originalPlayer) {
        rooms[roomId].players.splice(i, 1);
        i--; // Adjust index after removal
        continue;
      }
      
      // Mark players with zero balance as spectators
      if (rooms[roomId].players[i].balance <= 0) {
        rooms[roomId].players[i].status = 'spectating';
        rooms[roomId].players[i].cards = [];
        rooms[roomId].players[i].bet = 0;
        rooms[roomId].players[i].score = 0;
        
        // Emit an event to notify all clients that this player is spectating
        io.to(roomId).emit('player_spectating', {
          playerId: rooms[roomId].players[i].id,
          username: rooms[roomId].players[i].username
        });
        
        console.log(`Player ${rooms[roomId].players[i].username} is spectating due to zero balance (isHost: ${rooms[roomId].players[i].id === rooms[roomId].players[0]?.id})`);
      } else {
        // Reset active players
        rooms[roomId].players[i].cards = [];
        rooms[roomId].players[i].bet = 0;
        rooms[roomId].players[i].status = null; // Reset status
        rooms[roomId].players[i].score = 0;
      }
    }
    
    // Update game state
    rooms[roomId].gameState = 'betting';
    rooms[roomId].currentTurn = null;
    
    // Emit new round event
    io.to(roomId).emit('new_round', {
      players: rooms[roomId].players,
      gameState: 'betting',
      dealer: rooms[roomId].dealer,
      isAutoSkip: true // Always set to true when triggered by the host
    });
    
    // Log the new round
    console.log(`New round started in room ${roomId}, auto-skip: true`);
  });
  
  // Send chat message
  socket.on('send_message', ({ roomId, message, sender }) => {
    if (!rooms[roomId]) return;
    
    // Create message object
    const messageObj = {
      sender,
      content: message,
      timestamp: Date.now(),
      type: 'message'
    };
    
    // Emit message to all players in room
    io.to(roomId).emit('message', messageObj);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Find all rooms the user is in
    for (const roomId in rooms) {
      const playerIndex = rooms[roomId].players.findIndex(p => p.id === socket.id);
      
      if (playerIndex !== -1) {
        // Remove player from room
        const player = rooms[roomId].players[playerIndex];
        rooms[roomId].players.splice(playerIndex, 1);
        
        // If room is empty, delete it
        if (rooms[roomId].players.length === 0) {
          delete rooms[roomId];
          console.log(`Room ${roomId} deleted`);
          continue;
        }
        
        // Notify remaining players
        io.to(roomId).emit('player_left', {
          players: rooms[roomId].players,
          leftPlayer: player.username
        });
        
        // If game in progress and it was their turn, move to next player
        if (rooms[roomId].gameState === 'playing' && rooms[roomId].currentTurn === socket.id) {
          nextPlayerTurn(roomId);
        }
        
        console.log(`Player ${player.username} left room ${roomId}`);
      }
    }
  });
});

// Deal initial cards to all players and dealer
function dealInitialCards(roomId) {
  if (!rooms[roomId]) return;
  
  // Deal 2 cards to each player who has placed a bet
  for (let i = 0; i < rooms[roomId].players.length; i++) {
    const player = rooms[roomId].players[i];
    
    // Skip players who didn't place a bet (only mark as spectating if they have no bet)
    if (player.bet === 0) {
      player.status = 'spectating';
      player.cards = []; // Ensure spectators have no cards
      player.score = 0;
      rooms[roomId].players[i] = player;
      
      // Emit an event to notify all clients that this player is spectating
      io.to(roomId).emit('player_spectating', {
        playerId: player.id,
        username: player.username
      });
      
      continue;
    }
    
    player.cards = [
      rooms[roomId].deck.pop(),
      rooms[roomId].deck.pop()
    ];
    player.score = calculateHandValue(player.cards);
    
    // Check for blackjack
    if (isBlackjack(player.cards)) {
      player.status = 'blackjack';
    }
    
    // Update player in room
    rooms[roomId].players[i] = player;
    
    // Emit card dealt event
    io.to(roomId).emit('card_dealt', {
      to: player.id,
      cards: player.cards,
      score: player.score
    });
  }
  
  // Deal 2 cards to dealer
  rooms[roomId].dealer.cards = [
    rooms[roomId].deck.pop(),
    rooms[roomId].deck.pop()
  ];
  rooms[roomId].dealer.score = calculateHandValue(rooms[roomId].dealer.cards);
  
  // Find the first player who is not spectating or has blackjack
  const firstActivePlayerIndex = rooms[roomId].players.findIndex(p => 
    p.status !== 'spectating' && p.status !== 'blackjack'
  );
  
  // Check if the first player has blackjack and move to the next player if needed
  if (rooms[roomId].players.length > 0 && firstActivePlayerIndex !== -1) {
    // Set the current turn to the first active player
    rooms[roomId].currentTurn = rooms[roomId].players[firstActivePlayerIndex].id;
    
    // If the player has blackjack, move to the next player
    if (rooms[roomId].players[firstActivePlayerIndex].status === 'blackjack') {
      nextPlayerTurn(roomId);
    } else {
      // Emit player turn event
      io.to(roomId).emit('player_turn', {
        playerId: rooms[roomId].currentTurn,
        players: rooms[roomId].players
      });
    }
  } else if (rooms[roomId].players.some(p => p.status !== 'spectating')) {
    // If all players have blackjack or are spectating but at least one player is not spectating,
    // move directly to dealer's turn
    rooms[roomId].currentTurn = 'dealer';
    io.to(roomId).emit('dealer_turn');
    
    // Start dealer's turn after a short delay
    setTimeout(() => {
      dealerTurn(roomId);
    }, 1000);
  }
}

// Move to the next player's turn
function nextPlayerTurn(roomId) {
  if (!rooms[roomId]) return;
  
  const currentTurnIndex = rooms[roomId].players.findIndex(p => p.id === rooms[roomId].currentTurn);
  if (currentTurnIndex === -1) return;
  
  // Check if the current player has a split hand that needs to be played
  const currentPlayer = rooms[roomId].players[currentTurnIndex];
  const splitHandIndex = rooms[roomId].players.findIndex(p => 
    p.originalPlayer === currentPlayer.id && !p.status
  );
  
  // If there's a split hand that hasn't been played yet, move to that hand
  if (splitHandIndex !== -1) {
    rooms[roomId].currentTurn = rooms[roomId].players[splitHandIndex].id;
    
    // Emit turn ended event
    io.to(roomId).emit('turn_ended', {
      nextTurn: rooms[roomId].currentTurn,
      players: rooms[roomId].players
    });
    
    // Emit player turn event
    io.to(roomId).emit('player_turn', {
      playerId: rooms[roomId].currentTurn,
      players: rooms[roomId].players
    });
    
    return;
  }
  
  // Find the next player who hasn't played yet and is not spectating
  let nextPlayerIndex = -1;
  for (let i = 1; i < rooms[roomId].players.length; i++) {
    const idx = (currentTurnIndex + i) % rooms[roomId].players.length;
    // Skip split hands that aren't the current player's turn
    if (rooms[roomId].players[idx].originalPlayer) continue;
    // Skip players who are spectating
    if (rooms[roomId].players[idx].status === 'spectating') continue;
    if (!rooms[roomId].players[idx].status) {
      nextPlayerIndex = idx;
      break;
    }
  }
  
  if (nextPlayerIndex === -1) {
    // All players have played, move to dealer's turn
    rooms[roomId].currentTurn = 'dealer';
    io.to(roomId).emit('dealer_turn');
    
    // Start dealer's turn after a short delay
    setTimeout(() => {
      dealerTurn(roomId);
    }, 1000);
  } else {
    // Set next player's turn
    rooms[roomId].currentTurn = rooms[roomId].players[nextPlayerIndex].id;
    
    // Check if the next player has blackjack
    const nextPlayer = rooms[roomId].players[nextPlayerIndex];
    if (nextPlayer.status === 'blackjack') {
      // If the next player has blackjack, immediately move to the next player
      io.to(roomId).emit('turn_ended', {
        nextTurn: rooms[roomId].currentTurn,
        players: rooms[roomId].players
      });
      
      // Emit player turn event
      io.to(roomId).emit('player_turn', {
        playerId: rooms[roomId].currentTurn,
        players: rooms[roomId].players
      });
      
      // Recursively move to the next player
      setTimeout(() => {
        nextPlayerTurn(roomId);
      }, 1000);
    } else {
      // Emit turn ended event
      io.to(roomId).emit('turn_ended', {
        nextTurn: rooms[roomId].currentTurn,
        players: rooms[roomId].players
      });
      
      // Emit player turn event
      io.to(roomId).emit('player_turn', {
        playerId: rooms[roomId].currentTurn,
        players: rooms[roomId].players
      });
    }
  }
}

// Dealer's turn
function dealerTurn(roomId) {
  if (!rooms[roomId]) return;
  
  // Reveal dealer's cards
  io.to(roomId).emit('card_dealt', {
    to: 'dealer',
    dealer: rooms[roomId].dealer
  });
  
  // Dealer draws cards until score is 17 or higher
  while (rooms[roomId].dealer.score < 17) {
    const card = rooms[roomId].deck.pop();
    rooms[roomId].dealer.cards.push(card);
    rooms[roomId].dealer.score = calculateHandValue(rooms[roomId].dealer.cards);
    
    // Emit card dealt event
    io.to(roomId).emit('card_dealt', {
      to: 'dealer',
      dealer: rooms[roomId].dealer
    });
  }
  
  // Set dealer status
  if (rooms[roomId].dealer.score > 21) {
    rooms[roomId].dealer.status = 'bust';
  } else if (isBlackjack(rooms[roomId].dealer.cards)) {
    rooms[roomId].dealer.status = 'blackjack';
  } else {
    rooms[roomId].dealer.status = 'stood';
  }
  
  // Determine winners and settle bets
  settleGame(roomId);
}

// Determine winners and settle bets
function settleGame(roomId) {
  if (!rooms[roomId]) return;
  
  const room = rooms[roomId];
  const dealer = room.dealer;
  const dealerScore = dealer.score;
  const dealerHasBlackjack = isBlackjack(dealer.cards);
  
  // Calculate results for each player
  const results = [];
  
  for (const player of room.players) {
    // Skip split hands for results calculation (they're handled with their original player)
    if (player.originalPlayer) continue;
    
    let outcome = '';
    let amountChange = 0;
    
    // Skip players who were spectating this round
    if (player.status === 'spectating') {
      outcome = 'spectating';
      results.push({
        playerId: player.id,
        username: player.username,
        outcome,
        amountChange
      });
      continue;
    }
    
    // Handle different outcomes
    if (player.status === 'blackjack') {
      if (dealerHasBlackjack) {
        outcome = 'push';
        amountChange = 0;
      } else {
        outcome = 'blackjack';
        amountChange = Math.floor(player.bet * 1.5);
        player.balance += player.bet + amountChange;
      }
    } else if (player.status === 'bust') {
      outcome = 'bust';
      amountChange = -player.bet;
      // Balance already deducted when betting
    } else if (player.status === 'surrender') {
      outcome = 'surrender';
      amountChange = -Math.floor(player.bet / 2);
      player.balance += Math.floor(player.bet / 2); // Return half the bet
    } else if (dealerHasBlackjack) {
      outcome = 'lose';
      amountChange = -player.bet;
      // Balance already deducted when betting
    } else if (dealer.status === 'bust') {
      outcome = 'win';
      amountChange = player.bet;
      player.balance += player.bet * 2; // Original bet + winnings
    } else if (player.score > dealerScore) {
      outcome = 'win';
      amountChange = player.bet;
      player.balance += player.bet * 2; // Original bet + winnings
    } else if (player.score < dealerScore) {
      outcome = 'lose';
      amountChange = -player.bet;
      // Balance already deducted when betting
    } else {
      outcome = 'push';
      amountChange = 0;
      player.balance += player.bet; // Return the original bet
    }
    
    // Add to results
    results.push({
      playerId: player.id,
      username: player.username,
      outcome,
      amountChange
    });
    
    // Update leaderboard
    updateLeaderboard(player);
    
    // Mark players with zero balance as spectators for the next round
    if (player.balance <= 0) {
      player.status = 'spectating';
      console.log(`Player ${player.username} marked as spectator due to zero balance (isHost: ${player.id === room.players[0]?.id})`);
      
      // If this is the host, make sure they're properly marked as spectating
      if (player.id === room.players[0]?.id) {
        console.log(`Host ${player.username} has zero balance and is marked as spectating`);
      }
    }
  }
  
  // Update game state
  room.gameState = 'ended';
  room.currentTurn = null;
  
  // Emit game ended event with results
  io.to(roomId).emit('game_ended', {
    dealer,
    players: room.players,
    result: {
      dealerScore,
      dealerHasBlackjack,
      results
    }
  });
}

// Update leaderboard with player info
function updateLeaderboard(player) {
  const existingIndex = leaderboard.findIndex(p => p.id === player.id);
  
  if (existingIndex !== -1) {
    // Update existing player only if new balance is higher
    if (player.balance > leaderboard[existingIndex].balance) {
      leaderboard[existingIndex].balance = player.balance;
    }
  } else {
    // Add new player
    leaderboard.push({
      id: player.id,
      username: player.username,
      balance: player.balance
    });
  }
  
  // Sort leaderboard by balance
  leaderboard.sort((a, b) => b.balance - a.balance);
}

// Default route
app.get('/', (req, res) => {
  res.send('Blackjack Multiplayer Server is running');
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 