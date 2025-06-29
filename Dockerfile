# Stage1
FROM node:21-alpine AS builder

ARG APP_ENV=prod
ENV APP_ENV=${APP_ENV}

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage2
FROM nginx:alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 80
# Nginx起動
CMD ["nginx", "-g", "daemon off;"]
