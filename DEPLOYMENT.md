# Deployment Guide for Multiplayer Blackjack

This guide will help you deploy the Multiplayer Blackjack game for free so you can play with your friends.

## Option 1: Deploy with Render.com (Recommended)

### Deploy the Backend (Server)

1. Create a free account on [Render.com](https://render.com)
2. Click "New" and select "Web Service"
3. Connect your GitHub repository or use the "Public Git repository" option
4. Enter the repository URL if using the public option
5. Configure the service:
   - Name: `blackjack-server` (or any name you prefer)
   - Root Directory: `server`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Select the free plan
7. Click "Create Web Service"
8. Wait for the deployment to complete (this may take a few minutes)
9. Copy the URL provided by Render (e.g., `https://blackjack-server.onrender.com`)

### Deploy the Frontend (Client)

1. In Render dashboard, click "New" and select "Static Site"
2. Connect your GitHub repository or use the "Public Git repository" option
3. Configure the service:
   - Name: `blackjack-client` (or any name you prefer)
   - Root Directory: `client`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`
4. Add an environment variable:
   - Key: `REACT_APP_SOCKET_SERVER`
   - Value: Your backend URL from the previous step (e.g., `https://blackjack-server.onrender.com`)
5. Click "Create Static Site"
6. Wait for the deployment to complete
7. Your game will be available at the URL provided by Render

## Option 2: Deploy with Netlify and Railway

### Deploy the Backend (Server) on Railway

1. Create a free account on [Railway.app](https://railway.app)
2. Create a new project and select "Deploy from GitHub repo"
3. Connect your GitHub repository
4. Configure the deployment:
   - Root Directory: `server`
   - Start Command: `npm start`
5. Add an environment variable:
   - Key: `PORT`
   - Value: `5000`
6. Deploy the service
7. Once deployed, go to Settings > Networking and generate a domain
8. Copy the domain URL (e.g., `https://blackjack-server.up.railway.app`)

### Deploy the Frontend (Client) on Netlify

1. Create a free account on [Netlify](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub repository
4. Configure the build settings:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/build`
5. Add an environment variable:
   - Key: `REACT_APP_SOCKET_SERVER`
   - Value: Your Railway backend URL
6. Click "Deploy site"
7. Wait for the deployment to complete
8. Your game will be available at the Netlify URL provided

## Option 3: Deploy with Fly.io

### Deploy the Backend (Server)

1. Install the Fly.io CLI: `curl -L https://fly.io/install.sh | sh`
2. Login to Fly.io: `fly auth login`
3. Navigate to your server directory: `cd server`
4. Launch your app: `fly launch`
   - This will create a `fly.toml` file
5. Deploy your app: `fly deploy`
6. Get your app URL: `fly open`

### Deploy the Frontend (Client)

1. Navigate to your client directory: `cd client`
2. Update the `config.js` file with your Fly.io backend URL
3. Build your React app: `npm run build`
4. Create a new app for the frontend: `fly launch`
   - Choose a different name for this app
   - When asked about database, choose "No"
5. Deploy your frontend: `fly deploy`
6. Access your app: `fly open`

## Playing with Friends

Once deployed, you can:

1. Share the frontend URL with your friends
2. Create a room in the game
3. Share the room code with your friends so they can join
4. Start playing!

## Troubleshooting

- **Connection Issues**: Make sure your backend URL is correctly set in the frontend
- **CORS Errors**: Verify that your server's CORS settings allow requests from your frontend URL
- **Deployment Failures**: Check the logs in your hosting platform for specific error messages

Remember that free tiers of hosting services may have limitations such as:
- Limited compute resources
- Sleep after periods of inactivity (you may need to "wake up" the server)
- Bandwidth restrictions

Enjoy playing Blackjack with your friends! 