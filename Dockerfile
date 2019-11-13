FROM node: 12.13.0-alpine

WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN npm run build
RUN npm link

ENV CAN_TRACKER_ANNOUNCE_URL=http://localhost/announce
ENV CAN_TRACKER_PORT=32323
ENV CAN_TRACKER_PATH=/usr/src/app

