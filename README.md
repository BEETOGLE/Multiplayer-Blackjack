# Multiplayer Blackjack

A real-time multiplayer blackjack game application where players can create game rooms, join existing rooms, and play blackjack with friends.

## Features

- **Multiplayer Gameplay**: Create or join game rooms to play with friends.
- **Real-time Interaction**: Socket.IO-powered real-time game updates and chat.
- **Complete Blackjack Rules**: Implements standard blackjack rules including hit, stand, double down, and surrender.
- **Visual Card Display**: Beautiful card rendering and animations.
- **Game History**: Track your wins, losses, and performance over time.
- **Leaderboard**: Compete with others to reach the top of the leaderboard.
- **Responsive Design**: Play on any device with a responsive UI.

## Technologies Used

### Frontend
- React
- React Router
- Styled Components
- Socket.IO Client

### Backend
- Node.js
- Express
- Socket.IO
- UUID

## Setup & Installation

### Prerequisites
- Node.js (v14+ recommended)
- npm or yarn

### Installation Steps

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/multiplayer-blackjack.git
   cd multiplayer-blackjack
   ```

2. Install dependencies for both client and server:
   ```
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. Create a `.env` file in the client directory (optional):
   ```
   REACT_APP_SOCKET_SERVER=http://localhost:5000
   ```

4. Start the development servers:

   For the backend:
   ```
   cd server
   npm run dev
   ```

   For the frontend (in a separate terminal):
   ```
   cd client
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## How to Play

1. **Create or Join a Room**:
   - Enter your username
   - Create a new room or join an existing one with a room code

2. **Invite Friends**:
   - Share the room code with friends so they can join

3. **Start the Game**:
   - The room creator (host) can start the game once at least 2 players have joined

4. **Place Bets**:
   - Each player must place a bet to participate in the round

5. **Play Your Hand**:
   - When it's your turn, choose from available actions:
     - Hit: Take another card
     - Stand: End your turn
     - Double Down: Double your bet and take one more card
     - Surrender: Give up half your bet and end your turn

6. **Dealer's Turn**:
   - After all players have played, the dealer reveals their hole card and plays according to standard rules (hits until 17 or higher)

7. **Results**:
   - Winners are determined and bets are settled
   - A new round can be started

## Game Rules

- Blackjack pays 3:2
- Dealer stands on soft 17
- Doubling is allowed on any first two cards
- Surrender is available on first action
- No insurance or side bets implemented

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Card deck assets: [Card Library](https://github.com/deck-of-cards/standard-deck)
- Blackjack rules: [Bicycle Cards](https://bicyclecards.com/how-to-play/blackjack/) 