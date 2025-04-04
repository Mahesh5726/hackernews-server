# Use Ubuntu as base image
FROM ubuntu:22.04

# Install Node.js v22.14.0 and npm
RUN apt-get update && apt-get install -y curl ca-certificates gnupg && \
  mkdir -p /etc/apt/keyrings && \
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
  NODE_MAJOR=22 && \
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" > /etc/apt/sources.list.d/nodesource.list && \
  apt-get update && \
  apt-get install -y nodejs && \
  node -v && \
  npm -v && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only needed files
COPY package*.json ./
COPY tsconfig*.json ./
COPY src ./src

# Copy Prisma folder only if it exists by copying everything, relying on .dockerignore
COPY . .

RUN npm install

RUN if [ -f "./prisma/schema.prisma" ]; then npx prisma generate; else echo "Skipping prisma generate"; fi

# Add database migration step
RUN if [ -f "./prisma/schema.prisma" ]; then npx prisma migrate deploy; else echo "Skipping prisma migrate"; fi

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]