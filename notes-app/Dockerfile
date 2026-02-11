FROM node:22-slim

# Run as node user for proper permissions
USER node

WORKDIR /app

# Install curl for healthcheck (as root)
USER root
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
USER node

# Copy package files
COPY --chown=node:node package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app files
COPY --chown=node:node . .

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
