# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
# This step is done early to leverage Docker's build cache
COPY package*.json ./

# Install project dependencies
RUN npm install --omit=dev

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port your application listens on
EXPOSE 3000

# Define the command to run your application
CMD ["npm", "start"]
