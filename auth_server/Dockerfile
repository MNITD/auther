FROM node:12

WORKDIR /usr/auth_server
COPY package*.json ./

RUN npm install

COPY src ./src
COPY .babelrc ./
#COPY storage ./storage

EXPOSE 9000

CMD ['npm', 'run', 'serve']
