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

# Copy models directory (MongoDB models)
COPY server/models ./models/

# Copy db directory (database connection)
COPY server/db ./db/

# Copy public directory (admin panel)
RUN mkdir -p public
COPY server/public/index.html ./public/index.html

# Expose port (Railway sets PORT automatically)
EXPOSE 3000

# Start server
CMD ["npm", "start"]

