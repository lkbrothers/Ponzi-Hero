FROM ubuntu:latest

# INSTALL ESSENTIAL PACKAGES
RUN apt-get update && apt-get install -y curl

# INSTALL NODEJS
RUN curl -fsSL https://deb.nodesource.com/setup_23.x | bash - && \
    apt-get update && apt-get install -y nodejs && \
    node -v

# INSTALL PNPM
RUN curl -fsSL https://get.pnpm.io/install.sh | bash - && . /root/.bashrc
ENV PATH="/root/.local/share/pnpm:$PATH"

# INSTALL SOLANA
RUN curl --proto '=https' --tlsv1.2 -sSfL https://raw.githubusercontent.com/solana-developers/solana-install/main/install.sh | bash
ENV PATH="/root/.local/share/solana/install/active_release/bin:${PATH}"

# SOLANA CONFIG SETTINGS
# RUN solana config set --url mainnet-beta
# RUN solana config set --url devnet
RUN solana config set --url localhost
# RUN solana config set --url testnet

EXPOSE 3000 8001 8899 9900
# CMD [ "bash" ]
CMD ["tail", "-f", "/dev/null"]
# CMD ["bash", "-c", "tail -f /dev/null & exec bash"]
