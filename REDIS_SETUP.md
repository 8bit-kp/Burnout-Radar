# Redis Caching Setup Guide

Redis has been added to dramatically speed up journal fetching from Firestore.

## Performance Improvement

- **Without Redis**: 2-10 seconds (Firestore query)
- **With Redis**: 10-50ms (cached data) ⚡

## Option 1: Run Local Redis (Development)

### macOS (using Homebrew)
```bash
# Install Redis
brew install redis

# Start Redis
brew services start redis

# Or run Redis in foreground
redis-server
```

### Using Docker
```bash
# Run Redis container
docker run -d -p 6379:6379 --name redis redis:alpine

# Stop Redis
docker stop redis

# Start Redis again
docker start redis
```

Then add to your `.env.local`:
```bash
REDIS_URL=redis://localhost:6379
```

## Option 2: Use Upstash (Free Cloud Redis)

Perfect for production and no setup required!

1. Go to [Upstash](https://upstash.com/)
2. Sign up (free tier: 10,000 commands/day)
3. Create a new Redis database
4. Copy the Redis URL (looks like: `redis://default:password@xxx.upstash.io:6379`)
5. Add to `.env.local`:
   ```bash
   REDIS_URL=redis://default:your_password@your-redis.upstash.io:6379
   ```

## Option 3: No Redis (Fallback)

The app works fine without Redis! Just leave `REDIS_URL` empty in `.env.local`:
```bash
REDIS_URL=
```

You'll see this in the console:
```
Redis unavailable, continuing without cache
```

## How It Works

### First Request
1. User loads dashboard
2. API checks Redis cache (miss)
3. Queries Firestore (slow: 2-5 seconds)
4. Saves result to Redis (expires in 5 minutes)
5. Returns journals

### Subsequent Requests (within 5 minutes)
1. User refreshes page
2. API checks Redis cache (hit!) ✓
3. Returns cached journals (fast: 10-50ms)
4. No Firestore query needed!

### Cache Invalidation
When you save a new journal:
1. Journal saved to Firestore
2. Redis cache automatically cleared for your user
3. Next fetch will refresh the cache

## Verify It's Working

Check the server console logs:

**Cache Hit (Fast):**
```
Fetching journals for user: abc123
✓ Cache hit - returned in 25ms
```

**Cache Miss (First time):**
```
Fetching journals for user: abc123
Cache miss - querying Firestore
✓ Fetched 30 journals from Firestore in 2500ms (cached)
```

## Troubleshooting

### "Redis connection failed"
- Make sure Redis is running: `redis-cli ping` should return `PONG`
- Check your REDIS_URL is correct
- The app will continue without cache

### Still slow after setup
- First request will always be slow (cache miss)
- Refresh the page - second request should be instant
- Check console logs for "Cache hit" message

## Production Deployment

For production (Vercel, etc.), use Upstash:
- Free tier is enough for most apps
- Add `REDIS_URL` to your deployment environment variables
- That's it! ✨
