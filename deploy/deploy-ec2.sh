#!/bin/bash
# ==============================================================================
# AURELIA — AWS EC2 Ubuntu Production Deployment & Provisioning Script
# Tested on: Ubuntu 22.04 LTS / Ubuntu 24.04 LTS
# Usage: sudo bash deploy/deploy-ec2.sh
# ==============================================================================

set -e

echo "=========================================================="
echo " Starting AURELIA Luxury Salon Production Server Setup... "
echo "=========================================================="

# 1. Update OS packages
echo "[1/8] Updating package index..."
sudo apt update && sudo apt upgrade -y

# 2. Install Essential Tools & Repositories
echo "[2/8] Installing build tools, Git, unzip, and software-properties-common..."
sudo apt install -y software-properties-common curl git unzip ufw zip

# Add PHP PPA
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update

# 3. Install PHP 8.2 & Extensions
echo "[3/8] Installing PHP 8.2 and extensions..."
sudo apt install -y php8.2 php8.2-fpm php8.2-mysql php8.2-mbstring \
    php8.2-xml php8.2-curl php8.2-zip php8.2-gd php8.2-intl

# 4. Install MySQL Server & Nginx Web Server
echo "[4/8] Installing Nginx and MySQL..."
sudo apt install -y nginx mysql-server certbot python3-certbot-nginx

# 5. Install Composer
echo "[5/8] Installing Composer..."
if ! command -v composer &> /dev/null; then
    curl -sS https://getcomposer.org/installer | php
    sudo mv composer.phar /usr/local/bin/composer
    sudo chmod +x /usr/local/bin/composer
fi

# 6. Install Node.js 20 LTS & npm
echo "[6/8] Installing Node.js 20 LTS..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# 7. Configure Firewall (UFW)
echo "[7/8] Configuring UFW Firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# 8. Start & Enable Services
echo "[8/8] Starting system services..."
sudo systemctl enable nginx
sudo systemctl start nginx
sudo systemctl enable php8.2-fpm
sudo systemctl start php8.2-fpm
sudo systemctl enable mysql
sudo systemctl start mysql

echo "=========================================================="
echo " Server Packages Successfully Provisioned! "
echo " PHP: $(php -v | head -n 1)"
echo " Node: $(node -v)"
echo " Composer: $(composer --version | head -n 1)"
echo " Nginx: Active"
echo " MySQL: Active"
echo "=========================================================="
echo "Next: Configure MySQL Database and deploy your files to /var/www/aurelia-salon"

