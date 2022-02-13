FROM node:lts-alpine

WORKDIR /app

COPY . .

RUN npm install \
    && npm run build

EXPOSE 24444

CMD ["node", "/app/dist/app.js"]
