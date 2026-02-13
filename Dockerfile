FROM node:18

WORKDIR /usr/src/app

# Install MySQL client for wait-for-it script
RUN apt-get update && apt-get install -y default-mysql-client && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

# Clean install dependencies to ensure we don't use cached modules
RUN npm ci

COPY . .

# Make scripts executable
RUN chmod +x ./scripts/wait-for-it.sh
RUN chmod +x ./scripts/init-db.sh

EXPOSE 3000

CMD ["npm", "start"]
