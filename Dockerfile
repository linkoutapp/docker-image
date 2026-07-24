FROM node:22-slim

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev \
  && npm cache clean --force

USER node

CMD ["npm", "start"]
