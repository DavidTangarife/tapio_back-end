# Build stage
FROM node:alpine as build

WORKDIR /backend

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Production stage
FROM node:alpine

WORKDIR /backend

COPY --from=build /backend/package*.json ./
COPY --from=build /backend/node_modules ./node_modules
COPY --from=build /backend/dist ./dist

EXPOSE 5000

CMD ["node", "dist/index.js"]