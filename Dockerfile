FROM node:22.1.0

WORKDIR /app

# Copy only needed files
COPY package*.json ./
COPY tsconfig.json ./
COPY package-lock.json ./
COPY tsconfig.build.json ./
COPY src ./src ./
COPY prisma ./prisma ./


RUN npm install

RUN if [ -f "./prisma/schema.prisma" ]; then npx prisma generate; else echo "Skipping prisma generate"; fi

COPY . .

RUN npm run build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]