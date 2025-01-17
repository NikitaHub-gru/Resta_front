#Dockerfile

FROM node:alpine

# Set working directory
WORKDIR /usr/app

# Copy package.json and package-lock.json before other files
COPY ./package*.json ./

# Install dependencies and pm2
RUN npm install
RUN npm install --global pm2

# Copy all files
COPY ./ ./

# Build app
RUN npm run build

# Expose the listening port
EXPOSE 3000

# Run container as non-root user
USER node

CMD [ "pm2-runtime", "npm", "--", "start" ]