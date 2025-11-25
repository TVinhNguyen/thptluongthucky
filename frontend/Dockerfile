# Stage 1: Development
FROM node:20-alpine AS development

WORKDIR /app

# Install dependencies
COPY package.json bun.lockb* ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Stage 2: Build for production
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package.json bun.lockb* ./
RUN npm install

# Copy source code
COPY . .

# Build the app
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# Stage 3: Production with nginx
FROM nginx:alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
