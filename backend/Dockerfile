FROM node:22-alpine

# Install deps efficiently
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# Copy backend source
COPY . .

# Env + health
ENV NODE_ENV=production
EXPOSE 777
# IMPORTANT: Your app must read process.env.PORT; Railway sets it
CMD ["node", "src/app.js"]
