FROM node:lts-slim as full_version
WORKDIR /usr/lib/app

COPY package.json .

RUN npm install -g lerna

COPY packages ./packages/
COPY lerna.json .

RUN lerna bootstrap -- --production

CMD [ "npm", "--prefix", "packages/velo-external-db", "start" ]

FROM node:lts-slim
ARG TYPE
WORKDIR /usr/lib/app

COPY --from=full_version /usr/lib/app/packages/external-db-config/ ./packages/external-db-config/
COPY --from=full_version /usr/lib/app/packages/velo-external-db/ ./packages/velo-external-db/
COPY --from=full_version /usr/lib/app/packages/velo-external-db-core/ ./packages/velo-external-db-core/
COPY --from=full_version /usr/lib/app/packages/external-db-security/ ./packages/external-db-security/
COPY --from=full_version /usr/lib/app/packages/velo-external-db-commons/ ./packages/velo-external-db-commons/

COPY --from=full_version /usr/lib/app/packages/external-db-${TYPE}/ ./packages/external-db-${TYPE}/

ENV TYPE=${TYPE}

CMD [ "npm", "--prefix", "packages/velo-external-db", "start" ]
