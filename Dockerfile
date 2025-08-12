# Stage 1 — builder
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps first (better cache usage)
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --legacy-peer-deps

# Copy all source
COPY . .

# Build Next.js
RUN npm run build

# Stage 2 — runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Add user for security
RUN addgroup -S app && adduser -S app -G app
USER app

# Copy required build artifacts from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next

# Expose app port
EXPOSE 3000
ENV PORT=3000

# Start Next.js in production
CMD ["npm", "start"]
