#!/bin/bash

# Deploy script for Feel-Write

# 1. Build the application
echo "Building application..."
npm run build

# 2. Run database migrations if needed
echo "Running database migrations..."
npx prisma migrate deploy

# 3. Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

# 4. Set up custom domain if not already configured
echo "Checking custom domain configuration..."
vercel domains verify feel-write.com

echo "Deployment complete!"

