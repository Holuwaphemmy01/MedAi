# Use Node.js 20 Alpine as the base image
FROM node:20-alpine

# Install necessary packages for networking
RUN apk add --no-cache ca-certificates

# Set the working directory inside the container
WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy all source files
COPY . .

# Build the TypeScript project
RUN npm run build

# Set production environment
ENV APP_ENV=production
ENV PORT=3000

# Required environment variables (will be overridden by --env-file)
ENV TELEGRAM_BOT_TOKEN=
ENV GOOGLE_API_KEY=
ENV LLM_MODEL=
ENV ADK_DEBUG=false

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["/usr/local/bin/node", "dist/src/index.js"]