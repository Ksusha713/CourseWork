FROM node:23-slim
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /usr/src/app

COPY package*.json ./

RUN pnpm install 

COPY . .


EXPOSE 5000

CMD [ "pnpm", "dev" ]