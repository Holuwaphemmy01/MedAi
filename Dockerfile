# Use Node.js LTS version as the base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install pnpm globally and project dependencies
RUN npm install -g pnpm && pnpm install

# Preinstall MCP Telegram client to avoid runtime npx fetch timeouts
RUN npm install -g @iqai/mcp-telegram

# Copy project files
COPY . .

# Build the application
RUN pnpm build

# Expose port 3000
EXPOSE 3000
 
# Start the application
CMD ["pnpm", "start"]