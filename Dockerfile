FROM node:18.17.1-buster-slim
WORKDIR /app
COPY public/ /app/public
COPY src/ /app/src
COPY vite.config.js index.html brand.png /app/

COPY package.json /app/
COPY package-lock.json /app/

RUN npm install
EXPOSE 5173

# CMD ["npm", "run","dev"]
