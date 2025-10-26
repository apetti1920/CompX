FROM node:18-alpine AS base

# Install Python and build dependencies required for native modules
RUN apk add --no-cache python3 py3-setuptools make g++

WORKDIR /compx

# Copy root package files and lerna config
ADD ./package.json ./lerna.json ./
ADD ./tsconfig.json ./

# Copy all package.json files to set up workspace structure
ADD ./packages/common/package.json ./packages/common/
ADD ./packages/web_app/package.json ./packages/web_app/
ADD ./packages/electron_app/package.json ./packages/electron_app/
ADD ./packages/electron_loader/package.json ./packages/electron_loader/

# Install all dependencies using workspace
RUN --mount=type=cache,target=/usr/src/app/.npm \
        npm set cache /usr/src/app/.npm && npm install

# Add common package source
ADD ./packages/common/tsconfig.json ./packages/common/
ADD ./packages/common/src ./packages/common/src


FROM base AS loader_builder

ADD ./packages/electron_loader/index.html ./packages/electron_loader/
ADD ./packages/electron_loader/tsconfig.json ./packages/electron_loader/
ADD ./packages/electron_loader/webpack ./packages/electron_loader/webpack
ADD ./packages/electron_loader/assets ./packages/electron_loader/assets
ADD ./packages/electron_loader/src ./packages/electron_loader/src

RUN npm run build --workspace=@compx/electron_loader

FROM base AS web_builder_base

ADD ./packages/web_app/index.html ./packages/web_app/
ADD ./packages/web_app/.babelrc ./packages/web_app/
ADD ./packages/web_app/tsconfig.json ./packages/web_app/
ADD ./packages/web_app/webpack ./packages/web_app/webpack
ADD ./packages/web_app/src ./packages/web_app/src

FROM web_builder_base AS web_dev

CMD npm run start --workspace=@compx/web_app

FROM web_builder_base AS web_builder

ENV BUILD_TYPE=web
RUN npm run build --workspace=@compx/web_app

FROM nginx:latest AS web_server
COPY --from=web_builder /compx/packages/web_app/dist /usr/share/nginx/html/

FROM base AS electon_builder_linux

COPY --from=web_builder /compx/packages/web_app/dist ./packages/electron_app/dist/renderer/app
COPY --from=loader_builder /compx/packages/electron_loader/dist ./packages/electron_app/dist/renderer/loader

ADD ./packages/electron_app/build.py ./packages/electron_app/
ADD ./packages/electron_app/tsconfig.json ./packages/electron_app/
ADD ./packages/electron_app/static ./packages/electron_app/static
ADD ./packages/electron_app/src ./packages/electron_app/src

WORKDIR /compx/packages/electron_app
RUN npx tsc

WORKDIR /compx
RUN npm run builder --workspace=@compx/electron_app && npm run postbuilder --workspace=@compx/electron_app