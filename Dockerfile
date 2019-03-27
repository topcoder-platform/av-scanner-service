FROM node:8.11.3-alpine

#fix for debian jessie issue 
RUN sed -i '/jessie-updates/d' /etc/apt/sources.list

# Add necessary build tools to install packages from Git
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh python make

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . .

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]
