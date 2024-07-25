FROM node:18-alpine

WORKDIR /app

COPY package*.json .

RUN npm install --only=prod

COPY . . 

CMD ["npm", "run", "prod"]

EXPOSE 4000