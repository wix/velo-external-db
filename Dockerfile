# Compile stage
FROM node:20-slim 
WORKDIR /usr/lib/app

# Copy the project dir
COPY . .

# Install NX and project dependencies
RUN yarn global add nx
RUN yarn install --frozen-lockfile

# Build the JS files
RUN nx run-many --target=build --all


FROM node:20-alpine

WORKDIR /usr/lib/app

# Copy the compiled JS files from the compile stage
COPY --from=0 /usr/lib/app/dist/apps/velo-external-db .

# Install dependencies
RUN yarn install --production --frozen-lockfile

# Run the app
CMD node ./main.js
