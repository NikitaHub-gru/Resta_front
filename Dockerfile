# Use Node.js base image
FROM node:18-alpine as builder

# рабочая директория
WORKDIR /app

# копируем указанные файлы в корень контейнера
COPY package.json package-lock.json ./

# устанавливаем зависимости
RUN npm install

# копируем остальные файлы в корень контейнера
COPY . .

# выполняем сборку
RUN npm run build

FROM nginx:latest

COPY --from=builder /app/build /usr/share/nginx/html

# открываем порт
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
