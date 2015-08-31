# Use Ubuntu
FROM  ubuntu:14.04

# Ignore APT warnings about not having a TTY
ENV DEBIAN_FRONTEND noninteractive

# Ensure UTF-8 locale
RUN echo "LANG=\"en_GB.UTF-8\"" > /etc/default/locale
RUN locale-gen en_GB.UTF-8
RUN dpkg-reconfigure locales

# Install packages (keep list alphabetized)
RUN apt-get -y update --fix-missing && apt-get install -y \
    bison \
    build-essential \
    curl \
    g++ \
    gperf \
    git \
    git-core \
    libcairo2-dev \
    libjpeg-dev \
    libcurl3 \
    libfontconfig1-dev \
    libfreetype6 \
    libssl-dev \
    perl \
    python \
    ruby

# Install node.js
RUN curl -sL https://deb.nodesource.com/setup_0.12 | sudo bash -
RUN apt-get install -y \
    nodejs

# Install node_modules modules
RUN npm run install

# Create app directory
RUN mkdir -p /var/app/current

# Bundle app source
COPY ./app /var/app/current

# Expose app port
EXPOSE 8080
ENV PORT 8080

WORKDIR /var/app/current

# Start the system
CMD node start
