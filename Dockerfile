FROM node:20-alpine

WORKDIR /app

# Copy package files from server directory
COPY server/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy server files
# Copy all .js files
COPY server/*.js ./

# Copy config directory
COPY server/config ./config/

# Copy public directory (admin panel)
# First ensure public directory exists, then copy files
RUN mkdir -p public
COPY server/public/index.html ./public/index.html

# Verify files were copied
RUN ls -la public/ && echo "Public directory contents:" && cat public/index.html | head -5 || echo "ERROR: index.html not found"

# Expose port (Railway sets PORT automatically)
EXPOSE 3000

# Start server
CMD ["npm", "start"]

