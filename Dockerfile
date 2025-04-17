# Use the official Node.js 20 image as the base image
FROM node:20-alpine AS base

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the source code
COPY . .

# Set environment variables
ARG GOOGLE_GENAI_API_KEY
ENV GOOGLE_GENAI_API_KEY=${GOOGLE_GENAI_API_KEY}

# Build the Next.js application
RUN npm run build

# Production image, copy all files and run next
FROM node:20-alpine AS production

ARG GOOGLE_GENAI_API_KEY
ENV GOOGLE_GENAI_API_KEY=${GOOGLE_GENAI_API_KEY}

WORKDIR /app

COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/package*.json ./
COPY --from=base /app/next.config.js ./

# Expose the port the app runs on
EXPOSE 9002

# Set the startup command
CMD ["npm", "start"]
