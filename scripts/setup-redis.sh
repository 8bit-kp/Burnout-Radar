#!/bin/bash

echo "🚀 Setting up Redis for journal caching..."
echo ""

# Check if Homebrew is installed (macOS)
if command -v brew &> /dev/null; then
    echo "✓ Homebrew detected"
    
    # Check if Redis is already installed
    if brew list redis &> /dev/null; then
        echo "✓ Redis already installed"
    else
        echo "📦 Installing Redis..."
        brew install redis
    fi
    
    echo ""
    echo "Starting Redis..."
    brew services start redis
    
    # Wait a moment for Redis to start
    sleep 2
    
    # Test connection
    if redis-cli ping &> /dev/null; then
        echo "✅ Redis is running!"
        echo ""
        echo "Add this to your .env.local file:"
        echo "REDIS_URL=redis://localhost:6379"
    else
        echo "⚠️  Redis installed but not responding. Try:"
        echo "  brew services restart redis"
    fi
    
elif command -v docker &> /dev/null; then
    echo "✓ Docker detected"
    echo "🐳 Starting Redis container..."
    
    # Check if container already exists
    if docker ps -a | grep -q redis-cache; then
        echo "Starting existing Redis container..."
        docker start redis-cache
    else
        echo "Creating new Redis container..."
        docker run -d -p 6379:6379 --name redis-cache redis:alpine
    fi
    
    # Wait for container to be ready
    sleep 2
    
    if docker exec redis-cache redis-cli ping &> /dev/null; then
        echo "✅ Redis container is running!"
        echo ""
        echo "Add this to your .env.local file:"
        echo "REDIS_URL=redis://localhost:6379"
    else
        echo "⚠️  Redis container started but not responding"
    fi
    
else
    echo "❌ Neither Homebrew nor Docker found"
    echo ""
    echo "Choose one option:"
    echo ""
    echo "Option 1: Install Homebrew (macOS)"
    echo "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    echo "  Then run this script again"
    echo ""
    echo "Option 2: Install Docker Desktop"
    echo "  Download from: https://www.docker.com/products/docker-desktop"
    echo "  Then run this script again"
    echo ""
    echo "Option 3: Use Upstash (Free Cloud Redis)"
    echo "  1. Go to https://upstash.com/"
    echo "  2. Create free account and database"
    echo "  3. Copy Redis URL to .env.local"
    echo ""
    echo "Option 4: Run without cache"
    echo "  The app works fine without Redis (just slower)"
    echo "  Leave REDIS_URL empty in .env.local"
fi

echo ""
echo "📝 Next steps:"
echo "  1. Add REDIS_URL to .env.local"
echo "  2. Restart your Next.js dev server"
echo "  3. Check console for 'Redis connected' message"
