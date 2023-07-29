FROM node:18

LABEL maintainer="me@kefan.me"

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY src ./src
COPY index.js ./
COPY config.json ./

CMD [ "npm", "start" ]


