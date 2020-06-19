FROM node:alpine

WORKDIR /code

COPY ./src /code/src
COPY ./.babelrc /code/.babelrc
COPY ./jsconfig.json /code/jsconfig.json
COPY ./package.json /code/package.json

RUN npm install

CMD ["npm", "run", "prod"]
