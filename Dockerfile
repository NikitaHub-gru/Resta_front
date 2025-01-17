# Use Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy project files
COPY . .

RUN npm run build
# Expose port (typical for React/Vue development servers)
EXPOSE 80

# Start development server with hot reload
CMD ["npm", "start"]