FROM node:22-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app files
COPY . .

# Build Next.js app
RUN npm run build

# Create notes directory
RUN mkdir -p /data/notes

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
