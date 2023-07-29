FROM node:18

LABEL maintainer="me@kefan.me"

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY src ./src
COPY index.js ./
COPY config.json ./

CMD [ "npm", "start" ]
