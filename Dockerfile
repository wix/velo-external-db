# Use the official lightweight Node.js image.
FROM node:16-slim

# Create and change to the app directory.
WORKDIR /usr/lib/app

# Copy application dependency manifests to the container image.
COPY package.json .

# Installing lerna to install the homemade packages.
RUN npm install -g lerna

# Copy the local packages.
COPY packages ./packages/

# Copy lernas configurations.
COPY lerna.json .

# Install production dependencies of the homemade packages.
RUN lerna bootstrap -- --production  --hoist

# Run velo-external-db service on container startup.
CMD [  "npm", "--prefix", "packages/velo-external-db", "start" ]