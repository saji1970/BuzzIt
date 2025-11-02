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
RUN mkdir -p public
COPY server/public ./public

# Verify admin panel file was copied
RUN if [ ! -f public/index.html ]; then \
      echo "ERROR: index.html not found!" && \
      ls -la public/ && \
      exit 1; \
    else \
      echo "✅ Admin panel HTML found" && \
      ls -lh public/index.html; \
    fi

# Expose port (Railway sets PORT automatically)
EXPOSE 3000

# Start server
CMD ["npm", "start"]

