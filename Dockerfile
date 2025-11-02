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
COPY server/config ./config/ 2>/dev/null || true

# Copy public directory (admin panel)
COPY server/public ./public/

# Verify public directory was copied
RUN ls -la public/ || echo "WARNING: public directory not found"

# Expose port (Railway sets PORT automatically)
EXPOSE 3000

# Start server
CMD ["npm", "start"]

