# # Use Node.js 20 Alpine as the base image
# FROM node:20-alpine

# # Install necessary packages for networking
# RUN apk add --no-cache ca-certificates

# # Set the working directory inside the container
# WORKDIR /app

# # Copy package files first for better Docker layer caching
# COPY package.json package-lock.json* ./

# # Install dependencies
# RUN npm ci

# # Copy all source files
# COPY . .

# # Build the TypeScript project
# RUN npm run build

# # Set production environment
# ENV APP_ENV=production
# ENV PORT=3000

# # Required environment variables (will be overridden by --env-file)
# ENV TELEGRAM_BOT_TOKEN=
# ENV GOOGLE_API_KEY=
# ENV LLM_MODEL=
# ENV ADK_DEBUG=false

# # Expose the port the app runs on
# EXPOSE 3000

# # Start the application
# CMD ["/usr/local/bin/node", "dist/src/index.js"]


















# ---- Base image -------------------------------------------------
FROM node:20-alpine AS builder

# Install ca-certificates (keeps your HTTPS calls happy)
RUN apk add --no-cache ca-certificates

# ---- Working directory -----------------------------------------
WORKDIR /app

# ---- Copy only package files (great for caching) ---------------
COPY package.json ./
COPY package-lock.json* ./

# Install *all* deps (dev deps needed for tsc)
RUN npm ci

# ---- Copy source code -----------------------------------------
COPY . .

# ---- Build TypeScript -----------------------------------------
RUN npm run build

# ---- Production stage (smaller image) -------------------------
FROM node:20-alpine

WORKDIR /app

# Copy only the built files + node_modules (production only)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# ---- Environment ------------------------------------------------
# ENV NODE_ENV=production
# ENV PORT=3000

# # These will be overridden by Render’s env vars / .env file
# ENV TELEGRAM_BOT_TOKEN=
# ENV GOOGLE_API_KEY=
# ENV LLM_MODEL=
# ENV ADK_DEBUG=false


ENV TELEGRAM_BOT_TOKEN=


ENV LLM_MODEL=
ENV GOOGLE_API_KEY=
ENV ADK_DEBUG=
ENV APP_ENV=

# ---- Expose port -------------------------------------------------
EXPOSE 3000

# ---- Start the bot ---------------------------------------------
CMD ["node", "dist/src/index.js"]