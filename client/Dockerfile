FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json ./

RUN npm install --force
COPY ./ ./

CMD ["npm", "run", "build"]

FROM nginx

EXPOSE 3006

COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
