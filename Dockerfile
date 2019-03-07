FROM node:10.15-slim

WORKDIR /usr/src/app

RUN apt update && apt install iverilog -y

COPY ./package*.json ./

RUN npm install

COPY ./ ./

EXPOSE 3000

CMD ["npm", "run", "start"]