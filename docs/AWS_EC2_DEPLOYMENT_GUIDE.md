# AURELIA — AWS EC2 Production Deployment & Server Architecture Manual

This guide provides end-to-end, production-grade instructions for deploying the **AURELIA Luxury Salon & Beauty Studio Management Platform** to an **Amazon Web Services (AWS) EC2** virtual server running **Ubuntu 24.04 LTS or 22.04 LTS**.

---

## Architecture Overview

```
                      Internet Clients & Staff
                                 │
                                 ▼
                     AWS Route 53 / Custom Domain
                      (A Record -> EC2 Elastic IP)
                                 │
                                 ▼ [HTTPS Port 443 - Let's Encrypt SSL]
                      AWS EC2 Security Group
                    (Ports: 80, 443, 22 SSH)
                                 │
                                 ▼
                         Nginx Web Server
          ┌──────────────────────┴──────────────────────┐
          ▼                                             ▼
Frontend SPA (Static)                         Backend REST API (FastCGI)
/var/www/aurelia-salon/frontend/dist          /var/www/aurelia-salon/backend/public
(React + Vite + Tailwind + Favicon)           (PHP 8.2-FPM + Composer)
          │                                             │
          │ [Axios API calls via /api/v1]              │ [PDO Prepared Statements]
          └─────────────────────────────────────────────┘
                                 │
                                 ▼
                         MySQL 8.0 / MariaDB
                         (Database: aurelia_salon)
```

---

## Step 1: Launch an AWS EC2 Instance

1. Log into your **AWS Management Console** and navigate to **EC2**.
2. Click **Launch Instance** and configure:
   - **Name:** `Aurelia-Salon-Production`
   - **Application and OS Images (AMI):** Select **Ubuntu Server 24.04 LTS** or **22.04 LTS (HVM), SSD Volume Type (64-bit x86)**.
   - **Instance Type:**
     - `t3.small` (2 vCPU, 2 GiB RAM) — **Recommended for standard salon operation**.
     - `t3.medium` (2 vCPU, 4 GiB RAM) — **Ideal for fast on-server React builds**.
   - **Key Pair (Login):**
     - Click **Create new key pair** (e.g. `aurelia-keypair.pem`), type `RSA`, file format `.pem`.
     - Download and save it securely on your Windows computer (e.g. `C:\Users\ABHINANDAN\.ssh\aurelia-keypair.pem`).
   - **Network Settings (Security Group):**
     - Create a Security Group named `aurelia-web-sg` with the following inbound rules:
       - **SSH (Port 22):** Source `My IP` (or `0.0.0.0/0`)
       - **HTTP (Port 80):** Source `0.0.0.0/0` (Anywhere)
       - **HTTPS (Port 443):** Source `0.0.0.0/0` (Anywhere)
   - **Configure Storage:**
     - 20 GiB gp3 (General Purpose SSD).
3. Click **Launch Instance**.
4. In the EC2 console, go to **Network & Security -> Elastic IPs**:
   - Click **Allocate Elastic IP address**.
   - Select the allocated IP, click **Actions -> Associate Elastic IP address**, and choose your new instance. *(This ensures your public IP remains permanent across server restarts).*

---

## Step 2: Connect to EC2 & Run the Auto-Provisioning Script

Open **PowerShell** on your Windows PC and connect to your EC2 instance:

```powershell
# Set permissions on your key pair (Windows PowerShell)
icacls "C:\path\to\aurelia-keypair.pem" /inheritance:r
icacls "C:\path\to\aurelia-keypair.pem" /grant:r "$($env:USERNAME):(R)"

# Connect to Ubuntu EC2
ssh -i "C:\path\to\aurelia-keypair.pem" ubuntu@<YOUR-EC2-ELASTIC-IP>
```

Once connected inside the server, run the automated provisioning script provided in the repository, or execute:

```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Install Git, Unzip, and Software Properties
sudo apt install -y software-properties-common curl git unzip ufw zip

# 3. Add PHP Repository and install PHP 8.2 + Extensions
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php8.2 php8.2-fpm php8.2-mysql php8.2-mbstring \
    php8.2-xml php8.2-curl php8.2-zip php8.2-gd php8.2-intl

# 4. Install Nginx Web Server, MySQL Server & Certbot
sudo apt install -y nginx mysql-server certbot python3-certbot-nginx

# 5. Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer

# 6. Install Node.js 20 LTS & npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 7. Configure UFW Firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

---

## Step 3: Configure MySQL Database on EC2

Log into MySQL on the server:

```bash
sudo mysql
```

Run the following SQL commands:

```sql
-- Create production database
CREATE DATABASE aurelia_salon CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create dedicated secure user
CREATE USER 'aurelia_user'@'localhost' IDENTIFIED BY 'AureliaSecurePass2026!';

-- Grant full permissions on database
GRANT ALL PRIVILEGES ON aurelia_salon.* TO 'aurelia_user'@'localhost';
FLUSH PRIVILEGES;

EXIT;
```

---

## Step 4: Upload Project Files to EC2

You have two easy methods to upload your files from your local PC to the EC2 server:

### Method A (Via Git — Recommended)
On your Windows machine in `d:\saloon-appointment-booking`:
```powershell
git init
git add .
git commit -m "Aurelia Salon Production Release"
git remote add origin https://github.com/YOUR_USERNAME/aurelia-salon.git
git push -u origin main
```

On your EC2 server:
```bash
sudo mkdir -p /var/www/aurelia-salon
sudo chown -R ubuntu:ubuntu /var/www/aurelia-salon
git clone https://github.com/YOUR_USERNAME/aurelia-salon.git /var/www/aurelia-salon
```

### Method B (Direct Secure Copy via SCP from Windows PowerShell)
On your Windows machine:
```powershell
# Compress project (excluding node_modules and vendor to make upload instantaneous)
# Then SCP directly:
scp -i "C:\path\to\aurelia-keypair.pem" -r "d:\saloon-appointment-booking\*" ubuntu@<YOUR-EC2-ELASTIC-IP>:/home/ubuntu/aurelia-salon/
```
On EC2:
```bash
sudo mkdir -p /var/www/aurelia-salon
sudo mv /home/ubuntu/aurelia-salon/* /var/www/aurelia-salon/
sudo chown -R ubuntu:ubuntu /var/www/aurelia-salon
```

---

## Step 5: Backend Production Setup & Database Migration

On the EC2 server:

```bash
cd /var/www/aurelia-salon/backend

# 1. Install PHP Composer dependencies (optimized for production)
composer install --no-dev --optimize-autoloader

# 2. Configure Production .env
cp .env.production.example .env
nano .env
```
Ensure your `.env` contains:
```ini
APP_NAME="AURELIA — Luxury Salon & Beauty Studio"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com

DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=aurelia_salon
DB_USERNAME=aurelia_user
DB_PASSWORD=AureliaSecurePass2026!
```

Import schema and seed initial database:
```bash
# 3. Import MySQL schema
mysql -u aurelia_user -pAureliaSecurePass2026! aurelia_salon < database/schema.sql

# 4. Run database seeder (categories, services, staff, coupons,CMS settings)
php database/seeds/FullSalonSeeder.php

# 5. Set proper file permissions for Web Server
sudo chown -R www-data:www-data /var/www/aurelia-salon/backend/storage /var/www/aurelia-salon/backend/public/uploads
sudo chmod -R 775 /var/www/aurelia-salon/backend/storage /var/www/aurelia-salon/backend/public/uploads
```

---

## Step 6: Frontend Production Build

On the EC2 server:

```bash
cd /var/www/aurelia-salon/frontend

# 1. Install npm dependencies
npm install

# 2. Create production environment file
cat << 'EOF' > .env.production
VITE_API_BASE_URL=/api/v1
EOF

# 3. Build optimized static production bundle
npm run build
```
The compiled files (including the newly designed luxury **gold favicon**, minified CSS, and optimized JS chunks) will be created inside:
`/var/www/aurelia-salon/frontend/dist`

---

## Step 7: Nginx Web Server Virtual Host Configuration

Copy the production Nginx configuration file provided in `deploy/nginx-aurelia.conf` to `/etc/nginx/sites-available/`:

```bash
sudo cp /var/www/aurelia-salon/deploy/nginx-aurelia.conf /etc/nginx/sites-available/aurelia-salon
```

Edit the file to put your domain or EC2 Elastic IP:
```bash
sudo nano /etc/nginx/sites-available/aurelia-salon
```
Update line 4:
`server_name yourdomain.com www.yourdomain.com;` *(or your EC2 Public IP if you don't have a custom domain yet)*.

Enable the site and verify configuration:
```bash
# Enable site
sudo ln -sf /etc/nginx/sites-available/aurelia-salon /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx syntax
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## Step 8: Domain DNS & Free Let's Encrypt SSL (HTTPS)

1. In your domain registrar (GoDaddy, Namecheap, Cloudflare, AWS Route 53):
   - Add an **A Record**: `@` -> `<YOUR-EC2-ELASTIC-IP>`
   - Add an **A Record**: `www` -> `<YOUR-EC2-ELASTIC-IP>`
2. Wait 2–5 minutes for DNS propagation, then run on your EC2 server:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
3. Enter your email address and agree to the terms.
4. Certbot will automatically configure HTTPS, rewrite Nginx to enforce SSL, and set up automatic renewal via systemd timer.

---

## Step 9: Production Verification & Verification Test

Test the live production installation:
1. Open your browser and navigate to `https://yourdomain.com` (or `http://<EC2-ELASTIC-IP>`).
2. Verify:
   - Luxury **A** crest favicon is prominently visible in the browser tab.
   - Public salon website loads with high-speed caching.
   - Login with demo credentials:
     - **Admin/Owner:** `admin@aurelia.com` / `Password123!`
     - **Stylist:** `elena.rostova@aurelia.com` / `Password123!`
     - **Customer:** `clara.d@luxury.test` / `Password123!`
   - Test booking an appointment via `/book`.
   - Test navigating to `/admin/loyalty` (Coupons & Privilege rules) and `/admin/settings` (Studio Settings).

---

## Step 10: Automatic Daily Database Backups (Cron)

Set up automated daily MySQL backups on your EC2 server:

```bash
sudo mkdir -p /var/backups/aurelia-salon
sudo nano /etc/cron.daily/aurelia-backup
```
Paste the following script:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/aurelia-salon"
DATE=$(date +\%Y\%m\%d_\%H\%M\%S)
mysqldump -u aurelia_user -pAureliaSecurePass2026! aurelia_salon | gzip > "$BACKUP_DIR/aurelia_backup_$DATE.sql.gz"
# Keep only last 14 days of backups
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +14 -delete
```
Make it executable:
```bash
sudo chmod +x /etc/cron.daily/aurelia-backup
```
Your production AURELIA platform is now fully deployed, secured, automated, and live!

