FROM node:16.14.2-alpine

RUN apk add g++ make python3

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . .

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]
