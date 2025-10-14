# Todo App

A simple dockerized todo application with React frontend, Node.js backend, and MongoDB database.

## Features

- Add new todos
- View all todos
- Mark todos as complete/incomplete
- Delete todos
- Fully dockerized with Docker Compose

## API Endpoints

- `GET /api/todos` - Get all todos
- `POST /api/todos` - Add a new todo
- `POST /api/todos/delete` - Delete a todo
- `POST /api/todos/modify` - Modify/update a todo

## Quick Start

1. Make sure you have Docker and Docker Compose installed
2. Clone this repository
3. Run the application:

```bash
docker-compose up --build
```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: mongodb://localhost:27017

## Testing with Postman

You can test the API endpoints directly using Postman:

### Get all todos
```
GET http://localhost:5000/api/todos
```

### Add a new todo
```
POST http://localhost:5000/api/todos
Content-Type: application/json

{
  "title": "Learn Docker",
  "description": "Complete the Docker tutorial"
}
```

### Delete a todo
```
POST http://localhost:5000/api/todos/delete
Content-Type: application/json

{
  "id": "todo_id_here"
}
```

### Modify a todo
```
POST http://localhost:5000/api/todos/modify
Content-Type: application/json

{
  "id": "todo_id_here",
  "title": "Updated title",
  "description": "Updated description",
  "completed": true
}
```

## Development

To run in development mode:

### Server
```bash
cd server
npm install
npm run dev
```

### Client
```bash
cd client
npm install
npm run dev
```

## Docker Commands

- Build and start all services: `docker-compose up --build`
- Start services in background: `docker-compose up -d`
- Stop services: `docker-compose down`
- View logs: `docker-compose logs`
- Rebuild specific service: `docker-compose build server`

## Architecture

- **Client**: React app built with Vite, served by Nginx
- **Server**: Node.js Express API with Mongoose ODM
- **Database**: MongoDB for data persistence
- **Networking**: All services communicate through a Docker bridge network