FROM node:20-alpine
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

RUN npm install

# Copy the rest of the application code
COPY . .

EXPOSE 3000

# Start the backend in development mode
CMD ["npm", "run", "start:dev"]
