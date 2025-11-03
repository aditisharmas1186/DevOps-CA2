FROM node:18-alpine

WORKDIR /app

# install dependencies
COPY package*.json ./
RUN npm install --production

# copy app source
COPY . .

EXPOSE 3000
CMD [ "node", "app.js" ]