FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3002

CMD ["npm", "start"]