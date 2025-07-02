#!/bin/bash

# AI Recipe Hub Server Deployment Script

echo "🚀 Deploying AI Recipe Hub Server..."

# Check if environment variables are set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY is not set"
    exit 1
fi

if [ -z "$STRIPE_SECRET_KEY" ]; then
    echo "❌ STRIPE_SECRET_KEY is not set"
    exit 1
fi

# Build the server
echo "📦 Building server..."
cd server
npm install
npm run build

# Start the server
echo "🎯 Starting server..."
npm start

echo "✅ Server deployed successfully!"
echo "🌐 Server running on port ${PORT:-3001}"