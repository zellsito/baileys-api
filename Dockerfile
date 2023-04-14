FROM node:lts-buster

RUN apt-get update && \
  apt-get upgrade -y && \
  npm install -g npm@9.3.1 && \ 
  rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src

CMD ["npm", "start"]