# образ
FROM node:20-alpine

# рабочая директория
WORKDIR /app

# копируем указанные файлы в корень контейнера
COPY package.json package-lock.json ./

# устанавливаем зависимости
RUN npm ci

# копируем остальные файлы в корень контейнера
COPY . .

# устанавливаем переменную
ENV NODE_ENV=production

# выполняем сборку
RUN npm run build

# открываем порт
EXPOSE 3000

# устанавливаем переменные окружения
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# запускаем приложение
CMD ["npm", "start"]