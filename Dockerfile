FROM node:18-alpine as base

WORKDIR /compx
ADD ./package.json ./
RUN --mount=type=cache,target=/usr/src/app/.npm \
        npm set cache /usr/src/app/.npm && npm install
ADD ./tsconfig.json ./

WORKDIR /compx/packages/common
ADD ./packages/common/package.json ./
RUN --mount=type=cache,target=/usr/src/app/.npm \
        npm set cache /usr/src/app/.npm && npm install
ADD ./packages/common/tsconfig.json ./
ADD ./packages/common/src ./src
RUN npm run build


FROM base as loader_builder
WORKDIR /compx/packages/electron_loader

ADD ./packages/electron_loader/package.json ./
RUN --mount=type=cache,target=/usr/src/app/.npm \
        npm set cache /usr/src/app/.npm && npm install

ADD ./packages/electron_loader/index.html ./
ADD ./packages/electron_loader/tsconfig.json ./
ADD ./packages/electron_loader/webpack ./webpack
ADD ./packages/electron_loader/assets ./assets
ADD ./packages/electron_loader/src ./src

RUN npm run build

FROM base as web_builder_base
WORKDIR /compx/packages/web_app

ADD ./packages/web_app/package.json .
RUN --mount=type=cache,target=/usr/src/app/.npm \
        npm set cache /usr/src/app/.npm && npm install

ADD ./packages/web_app/index.html ./
ADD ./packages/web_app/.babelrc ./
ADD ./packages/web_app/tsconfig.json ./
ADD ./packages/web_app/webpack ./webpack
ADD ./packages/web_app/src ./src

FROM web_builder_base as web_dev

CMD npm run start

FROM web_builder_base as web_builder

ENV BUILD_TYPE=web
RUN npm run build

FROM nginx:latest as web_server
COPY --from=web_builder /compx/packages/web_app/dist /usr/share/nginx/html/
