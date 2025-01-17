# Use Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy project files
COPY . .

# Build the Next.js application
RUN npm run build

# Expose port (default for Next.js production server)
EXPOSE 3000

# Start the Next.js production server
CMD ["npm", "start"]