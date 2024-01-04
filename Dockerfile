# Compile stage
FROM node:20-slim
WORKDIR /usr/lib/app

# Copy the project dir
COPY . .

# Install NX and project dependencies
RUN npm install -g nx
RUN npm install 

# Build the JS files
RUN nx run-many --target=build --all


FROM node:20-alpine

WORKDIR /usr/lib/app

# Copy the compiled JS files from the compile stage
COPY --from=0 /usr/lib/app/dist/apps/velo-external-db .

# Install dependencies
RUN npm install --production

# Run the app
CMD node ./main.js
