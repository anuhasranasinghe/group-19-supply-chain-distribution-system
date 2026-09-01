# -----------------------------------------------------------
# Backend Dockerfile — Development
# -----------------------------------------------------------
# This Dockerfile creates a Node.js container for the Express
# backend with hot-reload enabled via tsx --watch.
#
# In production, you would use a multi-stage build to compile
# TypeScript to JavaScript and run only the compiled output.
# For development, we run TypeScript directly using tsx.
# -----------------------------------------------------------

FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first for better Docker layer caching.
# Docker caches each layer — if package.json hasn't changed,
# npm install won't re-run on subsequent builds.
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the source code.
# In development, this layer is mostly overridden by the
# bind mount in docker-compose.yml, but it's needed for
# standalone container builds.
COPY . .

# Expose the backend port
EXPOSE 3000

# Start the development server with hot-reload.
# tsx --watch re-runs the server when source files change.
CMD ["npm", "run", "dev"]
