# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=22.1.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="SvelteKit"

# SvelteKit app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Install pnpm
ARG PNPM_VERSION=9.9.0
RUN npm install -g pnpm@$PNPM_VERSION


# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Install node modules
COPY .npmrc package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# Copy application code
COPY . .

ENV PUBLIC_BASE_URL="https://rplaylist.fly.dev"

# Build application
RUN --mount=type=secret,id=SPOTIFY_CLIENT_SECRET \
    --mount=type=secret,id=SPOTIFY_CLIENT_ID \
    SPOTIFY_CLIENT_SECRET="$(cat /run/secrets/SPOTIFY_CLIENT_SECRET)" \
    SPOTIFY_CLIENT_ID="$(cat /run/secrets/SPOTIFY_CLIENT_ID)" \
    pnpm run build

# Remove development dependencies
RUN pnpm prune --prod


# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app/build /app/build
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "node", "./build/index.js" ]
