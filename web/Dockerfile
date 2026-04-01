# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build Vite app
RUN npm run build

# Serve stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install serve to host the static files
RUN npm install -g serve

# Copy built assets
COPY --from=builder /app/dist ./dist

# Expose port 8080 (Railway will map this)
EXPOSE 8080

# Run serve
CMD ["serve", "-s", "dist", "-l", "8080"]
