# Build stage
FROM node:alpine AS build

ARG MICROSOFT_CLIENT_SECRET=NONE
ARG GOOGLE_CLIENT_SECRET=NONE
ARG GOOGLE_CLIENT_ID=NONE
ARG MONGO_URI=NONE
ENV MICROSOFT_CLIENT_SECRET=$MICROSOFT_CLIENT_SECRET
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
ENV MONGO_URI=$MONGO_URI

RUN apk update && apk upgrade && apk add git
RUN git clone -b IMAP --single-branch https://github.com/DavidTangarife/tapio_back-end.git
WORKDIR /tapio_back-end
RUN npm ci
RUN npm run build
EXPOSE 3000
ENTRYPOINT ["node", "dist/index.js"]
