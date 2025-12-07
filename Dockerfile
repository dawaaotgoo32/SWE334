FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
USER root
# RUN chown -R root:app .

RUN npm install
COPY . .
EXPOSE 4000
CMD npm run dev