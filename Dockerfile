FROM node:18

WORKDIR /app

COPY package*.json ./
RUN pnpm install

COPY . .

RUN pnpm run build

CMD ["node", "dist/main"]