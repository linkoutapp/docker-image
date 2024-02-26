# Use Node.js 20 as base image
FROM node:20@sha256:cb7cd40ba6483f37f791e1aace576df449fc5f75332c19ff59e2c6064797160e

# Install necessary dependencies for Chrome and Puppeteer
RUN apt-get update \
    && apt-get install -y wget gnupg libxtst-dev libpng-dev libnss3 \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \
    && sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] https://dl-ssl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-khmeros fonts-kacst fonts-freefont-ttf libxss1 dbus dbus-x11 \
      --no-install-recommends \
    && service dbus start \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -r pptruser && useradd -rm -g pptruser -G audio,video pptruser

# Set up a non-root user
USER pptruser

# Set working directory
WORKDIR /home/pptruser

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Puppeteer code into the container
COPY test.example.js ./
COPY test.server.js ./
COPY .env ./

# Expose environment variables
ENV DBUS_SESSION_BUS_ADDRESS autolaunch:

# Command to run the Puppeteer script
CMD ["node", "test.server.js"]
