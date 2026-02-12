FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

RUN chmod +x ./scripts/*.sh

EXPOSE 3000

CMD ["sh", "./scripts/start.sh"]

