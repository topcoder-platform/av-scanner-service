FROM node:8.11.3-alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . .
RUN npm install
EXPOSE 3000
ENTRYPOINT ["npm", "start"]
