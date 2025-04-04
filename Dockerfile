# 🛠 Build Stage
FROM node:22.1.0 AS builder

WORKDIR /app

# Copy only necessary files first (improves caching)
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Build TypeScript files
RUN npm run build

# 🏗 Production Stage
FROM node:22.1.0

WORKDIR /app

# Copy built files and dependencies from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env .env  # Ensure .env is copied

# Set environment variables
ENV NODE_ENV=production

# Ensure Prisma is ready
RUN npx prisma generate
RUN npx prisma migrate deploy  # Apply migrations

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "dist/src/index.js"]
