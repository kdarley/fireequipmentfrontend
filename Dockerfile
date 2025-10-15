# Use official Node.js LTS Alpine image for small size and security
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Accept build-time arguments
ARG POSTGRES_URL
ARG POSTGRES_AUTH_URL
ARG POSTGRES_DATA_URL
ARG AUTH_SECRET
ARG AUTH_URL

# Set the env variables
ENV NODE_ENV=production
ENV POSTGRES_URL=$POSTGRES_URL
ENV POSTGRES_AUTH_URL=$POSTGRES_AUTH_URL
ENV POSTGRES_DATA_URL=$POSTGRES_DATA_URL
ENV AUTH_SECRET=$AUTH_SECRET
ENV AUTH_URL=$AUTH_URL

# Install pnpm globally
RUN npm install -g pnpm

# Copy package manifests for dependency installation
COPY package.json pnpm-lock.yaml* ./

# Install dependencies based on lockfile
RUN pnpm install --frozen-lockfile

# Copy all source files
COPY . .

# Build Next.js app
RUN pnpm build

# Expose port 3000 for the app
EXPOSE 3000

# Run the app in production mode
CMD ["pnpm", "start"]
