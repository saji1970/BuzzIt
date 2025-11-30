FROM node:20-alpine

WORKDIR /app

# Copy package files from server directory
COPY server/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy entire server directory structure
# This ensures all files and directories are copied
COPY server/ ./

# Ensure public directory exists (in case it's empty)
RUN mkdir -p public

# Expose port (Railway sets PORT automatically)
EXPOSE 3000

# Start server
CMD ["npm", "start"]
