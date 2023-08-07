FROM node:20-slim AS base

RUN apt-get update && apt-get install -y python3 ffmpeg && corepack enable && apt-get clean && rm -rf /var/lib/apt/lists/

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

COPY src /bamboo/src
COPY package.json /bamboo/package.json
COPY pnpm-lock.yaml /bamboo/pnpm-lock.yaml
COPY index.js /bamboo/index.js
COPY .env /bamboo/.env

WORKDIR /bamboo

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base
COPY --from=prod-deps /bamboo/node_modules /bamboo/node_modules
CMD [ "pnpm", "start" ]
