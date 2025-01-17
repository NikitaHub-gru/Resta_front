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

# Если вы хотите использовать статическую сборку, добавьте:
# RUN npm run export

FROM nginx:latest

# Если вы используете серверный рендеринг, используйте .next
# Если вы используете статическую сборку, используйте out
COPY --from=builder /app/.next /usr/share/nginx/html/.next
# или
# COPY --from=builder /app/out /usr/share/nginx/html

# открываем порт
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]