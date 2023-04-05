FROM node:16

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . /usr/src/app

EXPOSE 3000

CMD ["npm","run","dev"]