FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install --force
COPY ./ ./
RUN npm run build

FROM nginx:stable-alpine
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 3006
CMD ["nginx", "-g", "daemon off;"]