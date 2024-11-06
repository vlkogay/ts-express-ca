FROM node:22.7.0-alpine AS build


WORKDIR /app


COPY package.json package.json

RUN npm install --verbose --no-audit


COPY . .

RUN npm run lint
RUN npm run test
RUN npm run build




FROM node:22.7.0-alpine AS release
USER node

WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/.env ./.env
COPY --from=build /app/node_modules ./node_modules


CMD [ "node", "dist/server.js" ]