# ====== BUILD STAGE ======
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ====== RUNTIME STAGE ======
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html
COPY public/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]
