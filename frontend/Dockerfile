# -----------------------------------------------------------
# Frontend Dockerfile — Development
# -----------------------------------------------------------
# This Dockerfile creates a Node.js container for the Vite
# React dev server with HMR (Hot Module Replacement).
#
# The --host 0.0.0.0 flag in the dev command is critical:
# by default, Vite only listens on localhost (127.0.0.1),
# which is not accessible from outside the container.
# We need it to listen on all interfaces so Docker's port
# mapping (5173:5173) actually works.
# -----------------------------------------------------------

FROM node:22-alpine

WORKDIR /app

# Copy package files first for layer caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code (overridden by bind mount in dev)
COPY . .

# Expose the Vite dev server port
EXPOSE 5173

# Start the Vite dev server, listening on all interfaces
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
