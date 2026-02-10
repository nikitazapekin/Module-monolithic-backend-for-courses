FROM node:20-slim

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    make \
    g++ \
    wget \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Java (OpenJDK 17)
RUN apt-get update && apt-get install -y openjdk-17-jdk && rm -rf /var/lib/apt/lists/*

# .NET SDK 8 for C#
RUN wget https://packages.microsoft.com/config/debian/12/packages-microsoft-prod.deb -O /tmp/packages-microsoft-prod.deb \
    && dpkg -i /tmp/packages-microsoft-prod.deb \
    && rm /tmp/packages-microsoft-prod.deb \
    && apt-get update \
    && apt-get install -y dotnet-sdk-8.0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

RUN mkdir -p /tmp/code_execution

ENV PORT=3002
ENV NODE_ENV=production
ENV DOCKER=true
ENV DB_HOST=postgres
ENV DB_PORT=5432
ENV DB_USERNAME=postgres
ENV DB_PASSWORD=Belorus2010
ENV DB_NAME=platform
ENV DB_SYNCHRONIZE=true
ENV DB_LOGGING=true
ENV DB_RETRY_ATTEMPTS=10
ENV DB_RETRY_DELAY=5000
ENV DB_AUTO_LOAD_ENTITIES=true
ENV DB_MIGRATIONS_RUN=false
ENV DB_SSL=false
ENV MONGO_URL=mongodb://mongo:27017/eventstore
ENV JWT_SECRET=your-secret-key
ENV CODE_EXEC_TEMP_DIR=/tmp/code_execution

EXPOSE 3002

CMD ["node", "dist/main.js"]