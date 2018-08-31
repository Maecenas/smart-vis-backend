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
# ---- Test ----
# run linters, setup and tests
FROM dependencies AS test
COPY . .
RUN npm install \
  && npm cache clean --force
ENTRYPOINT [ "sh", "-c", "npm run lint && npm run test"]

#
# ---- Production ----
FROM dependencies AS production
# Bundle app source
COPY . .
EXPOSE 8080
CMD [ "npm", "start" ]
