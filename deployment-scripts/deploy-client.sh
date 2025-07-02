#!/bin/bash

# AI Recipe Hub Client Deployment Script

echo "🚀 Deploying AI Recipe Hub Client..."

# Check if environment variables are set
if [ -z "$VITE_STRIPE_PUBLISHABLE_KEY" ]; then
    echo "❌ VITE_STRIPE_PUBLISHABLE_KEY is not set"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the client
echo "🏗️ Building client..."
npm run build

echo "✅ Client built successfully!"
echo "📁 Build files are in the 'dist' directory"
echo "🌐 Deploy the 'dist' directory to your hosting provider"