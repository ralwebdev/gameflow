# GameFlow Backend

Node.js + Express + MongoDB API for the GameFlow frontend.

## Setup

1. Copy `.env.example` to `.env`.
2. Make sure MongoDB is running locally or update `MONGODB_URI`.
3. Install dependencies with `npm install`.
4. Start the API with `npm run dev`.

## Scripts

- `npm run dev` starts the API with nodemon.
- `npm run start` starts the API with Node.js.
- `npm run seed` inserts starter games and asset records when the collections are empty.

## Endpoints

- `GET /api/health`
- `GET /api/content`
- `GET /api/games`
- `GET /api/assets`

Use `?includeDrafts=true` on content endpoints if you want unpublished records returned too.
