FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV PIP_BREAK_SYSTEM_PACKAGES=1

RUN apt-get update && apt-get install -y \
    software-properties-common \
    wget \
    curl \
    python3 \
    python3-pip \
    libc6-i386 \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Install IOU dependencies (needs 32-bit libssl)
RUN dpkg --add-architecture i386 && apt-get update && apt-get install -y \
    libssl-dev:i386 \
    && rm -rf /var/lib/apt/lists/*

# Install GNS3 server exact version via pip
RUN pip3 install gns3-server==2.2.52

# Create directories
RUN mkdir -p /root/GNS3/images/IOU

# Generate IOURC license
COPY keygen.py /tmp/keygen.py
RUN python3 /tmp/keygen.py > /root/.iourc

EXPOSE 3080
EXPOSE 5000-5100

CMD ["gns3server", "--host", "0.0.0.0", "--port", "3080"]
