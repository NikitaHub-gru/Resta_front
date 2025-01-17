# Указываем базовый образ
FROM node:18 AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --production

# Копируем остальные файлы приложения
COPY . .

# Собираем приложение
RUN npm run build

# Создаем финальный образ
FROM node:18 AS production

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем только необходимые файлы из стадии сборки
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# Устанавливаем переменную окружения для режима продакшена
ENV NODE_ENV=production

# Открываем порт, на котором будет работать приложение
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"]