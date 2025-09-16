# Deployment Guide

## Production Deployment

### Prerequisites

- Docker and Docker Compose
- Domain name with SSL certificate
- PostgreSQL database
- Redis instance
- Discord Bot Token
- GitHub Personal Access Token

### Environment Variables

Copy `env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/discord_obsidian"
DB_PASSWORD="secure_password"

# Redis
REDIS_URL="redis://host:6379"

# Discord
DISCORD_CLIENT_ID="your_discord_client_id"
DISCORD_CLIENT_SECRET="your_discord_client_secret"
DISCORD_BOT_TOKEN="your_discord_bot_token"

# GitHub
GITHUB_TOKEN="your_github_token"

# NextAuth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your_nextauth_secret"

# API
NEXT_PUBLIC_API_URL="https://your-domain.com"
```

### Deployment Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd discord-to-obsidian
   ```

2. **Configure environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your production values
   ```

3. **Build and start services**
   ```bash
   docker-compose build
   docker-compose up -d
   ```

4. **Initialize database**
   ```bash
   docker-compose exec api npm run db:migrate
   ```

5. **Verify deployment**
   - Frontend: https://your-domain.com
   - API Health: https://your-domain.com/health

### SSL Configuration

For production, configure SSL certificates:

```yaml
# Add to docker-compose.yml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - api
```

### Monitoring

- Health checks are available at `/health`
- Logs can be viewed with `docker-compose logs -f`
- Monitor resource usage with `docker stats`

### Backup

Regular backups of the PostgreSQL database:

```bash
docker-compose exec postgres pg_dump -U postgres discord_obsidian > backup.sql
```

### Updates

To update the application:

```bash
git pull
docker-compose build
docker-compose up -d
docker-compose exec api npm run db:migrate
```
