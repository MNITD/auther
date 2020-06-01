FROM node:12

WORKDIR /usr/resource_server
COPY package*.json ./

RUN npm install

COPY src ./src
COPY .babelrc ./
#COPY storage ./storage

EXPOSE 3000

CMD ['npm', 'start']
