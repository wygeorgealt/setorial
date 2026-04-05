# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Accept build arguments from Railway
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build the application
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine AS runner

WORKDIR /app

# Install "serve" to host the static build
RUN npm install -g serve

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Standardize port to 8080 (same as CampusBites Nginx config)
EXPOSE 8080

CMD ["serve", "-s", "dist", "-l", "8080"]
