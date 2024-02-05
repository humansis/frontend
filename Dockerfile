FROM node:18-alpine

# install simple http server for serving static content
RUN npm install -g http-server
RUN npm install -g pnpm


# make the 'app' folder the current working directory
WORKDIR /app


EXPOSE 8080
