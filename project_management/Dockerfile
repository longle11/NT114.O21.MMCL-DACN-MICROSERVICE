FROM node:18-alpine
WORKDIR /app

COPY package*.json .

RUN npm install --only=prod

COPY . .
CMD [ "npm", "start", "prod" ]
EXPOSE 4003