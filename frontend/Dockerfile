# Base image with Node.js and npm. lightweight image for faster builds and smaller size.
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy only the dependency manifest files first. Docker to cache for faster rebuilds
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend project files into the container
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Run Vite dev server
CMD ["npm", "run", "dev", "--", "--host"]