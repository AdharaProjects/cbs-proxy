FROM node:8-slim

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
ADD . /app

RUN npm install

# Run start script when the container launches
CMD [ "node", "server.js" ]
