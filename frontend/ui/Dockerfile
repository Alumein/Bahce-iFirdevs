# 1. Build Aşaması
FROM node:18-alpine as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
# API adresini build alırken veriyoruz (aşağıda docker-compose'da tanımlayacağız)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# 2. Sunum Aşaması (Nginx ile statik dosya sunumu)
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# React Router için gerekli Nginx ayarı (Sayfa yenileyince 404 vermemesi için)
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]