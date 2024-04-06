FROM node:14.21.0-alpine

RUN apk update && apk add bash && apk add python && apk add make && npm install -g nodemon && npm install -g node-pre-gyp && npm install pm2 -g && npm install -g babel-cli && npm install -g concurrently

USER root

# Set default work directory
WORKDIR /var/www

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install && npm cache clean --force --loglevel=error

COPY . .

EXPOSE 3000