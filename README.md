# Team Chat Application

A full-stack real-time team chat application (Slack-like) built with React, NestJS, and MongoDB. Features include real-time messaging, channels, user authentication, online/offline presence, and message history with pagination.

## Features

### Core Features
- ✅ User authentication (signup/login) with JWT
- ✅ Real-time messaging using WebSockets
- ✅ Channels (create, join, leave)
- ✅ Online/offline presence tracking
- ✅ Message history with pagination
- ✅ Clean and functional UI

### Technical Stack
- **Frontend**: React with Vite, React Router, Socket.io Client
- **Backend**: NestJS with TypeScript, Socket.io
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure

```
D:\jaga1\
├── backend/          # NestJS application
│   ├── src/
│   │   ├── auth/     # Authentication module
│   │   ├── channels/ # Channels module
│   │   ├── messages/ # Messages module
│   │   ├── users/    # Users module
│   │   ├── gateway/  # WebSocket gateway
│   │   └── schemas/  # MongoDB schemas
│   └── .env          # Environment variables
├── frontend/         # React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/     # React contexts (Auth, Socket)
│   │   └── api.js        # API service
│   └── .env          # Environment variables
└── README.md
```

## Prerequisites

- Node.js (v20.19.0 or higher recommended)
- npm or yarn
- MongoDB (local or cloud instance like MongoDB Atlas)

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
MONGODB_URI=mongodb://localhost:27017/team-chat
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/team-chat

JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

PORT=3000

FRONTEND_URL=http://localhost:5173
```

Start the backend server:

```bash
npm run start:dev
```

The backend will run on `http://localhost:3000`

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:3000
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Documentation

### Authentication Endpoints

#### POST `/auth/signup`
Create a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "jwt-token",
  "user": {
    "id": "user-id",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

#### POST `/auth/login`
Login with existing credentials.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** Same as signup

### Channels Endpoints

All channel endpoints require authentication (Bearer token in Authorization header).

#### GET `/channels`
Get all channels (public channels and channels user is a member of).

**Response:**
```json
[
  {
    "_id": "channel-id",
    "name": "general",
    "description": "General discussion",
    "members": ["user-id-1", "user-id-2"],
    "isPrivate": false,
    "createdBy": "user-id",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

#### POST `/channels`
Create a new channel.

**Request Body:**
```json
{
  "name": "general",
  "description": "General discussion",
  "isPrivate": false
}
```

#### GET `/channels/:id`
Get channel details.

#### POST `/channels/:id/join`
Join a channel.

#### POST `/channels/:id/leave`
Leave a channel.

#### GET `/channels/:id/members`
Get channel members.

### Messages Endpoints

All message endpoints require authentication.

#### POST `/messages`
Create a new message.

**Request Body:**
```json
{
  "content": "Hello, world!",
  "channelId": "channel-id"
}
```

#### GET `/messages/channel/:channelId?page=1&limit=50`
Get messages for a channel with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Messages per page (default: 50)

**Response:**
```json
{
  "messages": [
    {
      "_id": "message-id",
      "content": "Hello, world!",
      "sender": {
        "_id": "user-id",
        "username": "johndoe",
        "email": "john@example.com"
      },
      "channel": {
        "_id": "channel-id",
        "name": "general"
      },
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

### Users Endpoints

#### GET `/users/me`
Get current user information (requires authentication).

### WebSocket Events

#### Client → Server

- `join-channel`: Join a channel room
  ```json
  { "channelId": "channel-id" }
  ```

- `leave-channel`: Leave a channel room
  ```json
  { "channelId": "channel-id" }
  ```

- `send-message`: Send a message
  ```json
  {
    "content": "Hello!",
    "channelId": "channel-id"
  }
  ```

- `typing-start`: Indicate user is typing
  ```json
  { "channelId": "channel-id" }
  ```

- `typing-stop`: Indicate user stopped typing
  ```json
  { "channelId": "channel-id" }
  ```

#### Server → Client

- `new-message`: New message received
  ```json
  {
    "_id": "message-id",
    "content": "Hello!",
    "sender": { ... },
    "channel": { ... },
    "createdAt": "..."
  }
  ```

- `user-online`: User came online
  ```json
  {
    "userId": "user-id",
    "username": "johndoe"
  }
  ```

- `user-offline`: User went offline
  ```json
  {
    "userId": "user-id",
    "username": "johndoe"
  }
  ```

- `online-users`: List of online users
  ```json
  [
    {
      "userId": "user-id",
      "username": "johndoe",
      "email": "john@example.com"
    }
  ]
  ```

## Deployment

### Backend Deployment

1. Build the application:
   ```bash
   cd backend
   npm run build
   ```

2. Set environment variables on your hosting platform:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A strong secret key
   - `PORT`: Port number (usually provided by hosting)
   - `FRONTEND_URL`: Your frontend URL

3. Start the application:
   ```bash
   npm run start:prod
   ```

**Recommended platforms:**
- Render
- Railway
- Fly.io
- Heroku

### Frontend Deployment

1. Build the application:
   ```bash
   cd frontend
   npm run build
   ```

2. Set environment variable:
   - `VITE_API_URL`: Your backend API URL

3. Deploy the `dist` folder to a static hosting service.

**Recommended platforms:**
- Vercel
- Netlify
- GitHub Pages

### Database Hosting

**MongoDB Atlas (Free tier available):**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in backend `.env`

**Other options:**
- Railway (MongoDB)
- Neon (PostgreSQL - requires schema changes)

## Development

### Backend Scripts

- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run lint` - Run linter

### Frontend Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Troubleshooting

### Backend Issues

1. **MongoDB Connection Error**
   - Verify MongoDB is running (if local)
   - Check `MONGODB_URI` in `.env`
   - Ensure network access is enabled (for MongoDB Atlas)

2. **Port Already in Use**
   - Change `PORT` in `.env`
   - Or kill the process using the port

### Frontend Issues

1. **Cannot Connect to Backend**
   - Verify `VITE_API_URL` in `.env`
   - Check backend is running
   - Verify CORS settings in backend

2. **WebSocket Connection Failed**
   - Check backend WebSocket gateway is running
   - Verify token is being sent correctly
   - Check network/firewall settings

## License

This project is created for internship assignment purposes.

## Notes

- JWT tokens are stored in localStorage (consider httpOnly cookies for production)
- Presence tracking is in-memory (consider Redis for production scaling)
- No message editing/deletion implemented (optional feature)
- No private channels access control UI (backend supports it)

