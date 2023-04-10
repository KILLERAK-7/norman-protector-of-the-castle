FROM node:17.3.0-alpine3.14

# Create app directory
WORKDIR /usr/app

COPY package.json ./

RUN npm install

COPY . /usr/app

EXPOSE 8080

CMD ["npm","run","dev"]