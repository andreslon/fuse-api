#---------------- Build NestJS Application ----------------
# Get Base Image for build
FROM node:22.14.0-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

#---------------- Run NestJS Application ----------------
# Get Base Image for production
FROM node:22.14.0 AS base

# Set Runtime Configurations
EXPOSE 3000

# Create app directory and non-root user
RUN mkdir -p /app && \
    groupadd -r appgroup && \
    useradd -r -g appgroup appuser && \
    chown -R appuser:appgroup /app

# Set working directory
WORKDIR /app

# Copy only necessary files from build stage
COPY --from=build --chown=appuser:appgroup /app/package*.json ./
COPY --from=build --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=build --chown=appuser:appgroup /app/dist ./dist

# Switch to non-root user
USER appuser

# Command to run the application - all environment variables will come from Kubernetes
CMD ["node", "dist/main"] 