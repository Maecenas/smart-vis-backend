#
# ---- Base Node ----
FROM node:alpine AS base
# Create app directory
WORKDIR /usr/src/app
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json .

#
# ---- Dependencies ----
FROM base AS dependencies
# Install app dependencies
RUN npm set progress=false \
  && npm config set depth 0 \
  && npm install --only=production \
  && npm cache clean --force

#
# ---- Production ----
FROM dependencies AS production
# Bundle app source
COPY . .
EXPOSE 8080
CMD [ "npm", "start" ]

#
# ---- DevelopmentDependencies ----
FROM base AS devDependencies
# Install app devDependencies
RUN npm set progress=false \
  && npm config set depth 0 \
  && npm install \
  && npm cache clean --force

#
# ---- Test ----
# run linters, setup and tests
FROM devDependencies AS test
COPY . .
CMD npm run lint && npm run test
