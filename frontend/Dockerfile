FROM node:22-alpine

WORKDIR /app

# Copy dependency files first for caching
COPY package.json package-lock.json ./

# Clean install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
