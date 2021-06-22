FROM node:latest
WORKDIR /app
ADD . /app
RUN npm install
EXPOSE 5000
CMD npm start