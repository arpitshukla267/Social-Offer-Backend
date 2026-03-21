# Social Offer Backend

Backend API server for the Social Offer application.

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the backend directory:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/social-offer
JWT_SECRET=your-secret-key-change-in-production
```

## Development

```bash
npm run dev
```

The server will run on `http://localhost:5000` by default.

## Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm start` - Start production server
- `npm run seed:user` - Seed a user in the database

## Seeding User

To add the default admin user (shuklaarpit440@gmail.com / arpit267):

1. Make sure MongoDB is running
2. Run: `npm run seed:user`

## API Endpoints

### Auth
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/signin` - Login
- `GET /api/auth/verify` - Verify token

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project (requires auth)
- `PUT /api/projects/:id` - Update project (requires auth)
- `DELETE /api/projects/:id` - Delete project (requires auth)
