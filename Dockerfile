FROM cypress/base:22.14.0

RUN mkdir /app

WORKDIR /app

COPY . /app

RUN npm install --save-dev cypress

RUN $(npm bin)/cypress verify

RUN ["npm", "run", "cy:run_spec"]