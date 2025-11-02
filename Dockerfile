FROM node:20-alpine

WORKDIR /app

# Copy package files from server directory
COPY server/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy server files
# Copy all .js files
COPY server/*.js ./

# Copy config directory if it exists
COPY server/config* ./config/ 2>/dev/null || true
COPY server/config ./config/ 2>/dev/null || true

# Copy public directory (admin panel)
# Check if public directory exists and copy it
RUN mkdir -p public

# Copy the index.html file - handle case where file might not exist
COPY --chown=node:node server/public/index.html ./public/index.html

# Expose port (Railway sets PORT automatically)
EXPOSE 3000

# Start server
CMD ["npm", "start"]

