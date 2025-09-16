# API Documentation

## Overview

L'API Discord-to-Obsidian fournit des endpoints pour gérer l'authentification Discord, la surveillance des canaux, et la création de notes Obsidian.

## Base URL

- Development: `http://localhost:3001`
- Production: `https://your-domain.com`

## Authentication

L'API utilise NextAuth.js pour l'authentification Discord.

### Endpoints

#### GET /api/auth/signin
Initiates Discord OAuth flow.

#### GET /api/auth/signout
Signs out the current user.

#### GET /api/auth/session
Returns the current user session.

## Discord Integration

#### GET /api/discord/servers
Returns list of Discord servers the user has access to.

#### GET /api/discord/channels/:serverId
Returns list of channels in a specific server.

#### POST /api/discord/channels/monitor
Starts monitoring a Discord channel.

#### DELETE /api/discord/channels/:channelId/monitor
Stops monitoring a Discord channel.

## Notes Management

#### GET /api/notes
Returns list of created notes.

#### GET /api/notes/:id
Returns a specific note.

#### POST /api/notes
Creates a new note.

#### PUT /api/notes/:id
Updates an existing note.

#### DELETE /api/notes/:id
Deletes a note.

## GitHub Integration

#### GET /api/github/config
Returns GitHub configuration for the user.

#### POST /api/github/config
Updates GitHub configuration.

#### POST /api/github/sync
Triggers manual sync with GitHub repository.

## Health Check

#### GET /health
Returns API health status.

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

## Rate Limiting

API requests are rate limited to 100 requests per minute per user.
