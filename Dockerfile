FROM node:20-alpine

WORKDIR /app

# Copy package files first
COPY server/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy all server files (package.json will be overwritten but that's fine)
# Copy index.js and all directories
COPY server/index.js ./
COPY server/config ./config/
COPY server/utils ./utils/
COPY server/models ./models/
COPY server/routes ./routes/
COPY server/services ./services/
COPY server/db ./db/
COPY server/public ./public/

# Expose port (Railway sets PORT automatically)
EXPOSE 3000

# Start server
CMD ["npm", "start"]
