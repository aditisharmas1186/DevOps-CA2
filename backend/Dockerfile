FROM node:18-alpine

WORKDIR /app

# Copy package files first to leverage Docker caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your backend files
COPY . .

EXPOSE 5000

CMD ["npm", "start"]
