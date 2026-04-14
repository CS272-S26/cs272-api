FROM node:22
WORKDIR /usr/src/app

COPY LICENSE LICENSE
COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

COPY app.js app.js
COPY includes/. includes/.

EXPOSE 23706
CMD [ "npm", "start" ]