# Moovr.Taxi Domain Configuration Guide

This guide walks you through configuring your Moovr project to use **moovr.taxi** domain with proper subdomains and SSL certificates.

---

## Overview

Your deployment will use these subdomains:
- **moovr.taxi** → Frontend (React/Vite) on port 80/443
- **www.moovr.taxi** → Alias for moovr.taxi (optional, redirects to moovr.taxi)
- **api.moovr.taxi** → Backend API (Node.js/Express) on port 5000 (proxied via Nginx)
- **admin.moovr.taxi** → Admin Panel (Next.js) on port 3000 (proxied via Nginx)

---

## Phase 1: DNS Configuration (Hostinger)

### 1.1 Access Hostinger DNS Settings

1. Login to your Hostinger account
2. Go to **Domains** → **moovr.taxi**
3. Click **Manage** or **DNS Records**
4. You should see the DNS Records section

### 1.2 Add A Records for Subdomains

Add the following A records pointing to your Hostinger VPS IP address:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ (root/moovr.taxi) | YOUR_VPS_IP | 3600 |
| A | www | YOUR_VPS_IP | 3600 |
| A | api | YOUR_VPS_IP | 3600 |
| A | admin | YOUR_VPS_IP | 3600 |

**Where to find YOUR_VPS_IP:**
- In Hostinger Dashboard → VPS/Server section
- It's usually listed as "Main IP" or "Server IP"

**⚠️ Wait 24-48 hours for DNS propagation** (usually 30 minutes to a few hours in practice)

### 1.3 Verify DNS Propagation

```bash
# On your local machine or VPS, test DNS resolution:
nslookup moovr.taxi
nslookup api.moovr.taxi
nslookup admin.moovr.taxi

# Should show your VPS IP address for all three
```

---

## Phase 2: Environment Configuration

### 2.1 Backend Environment (.env)

**File:** `moovr-backend/.env`

Update these values:

```env
# Server Configuration
PORT=5000
NODE_ENV=production
VITE_API_URL=https://api.moovr.taxi

# Database (MongoDB Atlas - no changes needed unless using local DB)
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/moovr_db

# JWT Secret (generate a strong one)
JWT_SECRET=your_super_strong_random_secret_key_min_32_chars

# Firebase
VITE_FIREBASE_PROJECT_ID=moovr-73876
FIREBASE_STORAGE_BUCKET=moovr-73876.firebasestorage.app
GOOGLE_APPLICATION_CREDENTIALS=./moovr-73876-firebase-adminsdk-fbsvc-911ab2686e.json

# Admin Alerts
ADMIN_ALERT_EMAIL=your_admin_email@gmail.com
ADMIN_ALERT_PHONE=+1234567890

# Stripe (if using payment)
STRIPE_SECRET_KEY=sk_live_your_stripe_key

# CORS Configuration
CORS_ORIGIN=https://moovr.taxi,https://www.moovr.taxi,https://admin.moovr.taxi,http://localhost:3000,http://localhost:5173

# Socket.io CORS Origins
SOCKET_IO_CORS_ORIGINS=https://moovr.taxi,https://admin.moovr.taxi,http://localhost:3000,http://localhost:5173
```

**⚠️ Important Security Notes:**
- Never commit `.env` file to git
- Add `.env` to `.gitignore`
- JWT_SECRET should be a random string (min 32 chars)
- Keep Firebase credentials private

**Generate a strong JWT_SECRET:**
```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows PowerShell:
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### 2.2 Frontend Environment (.env.production)

**File:** `moovr-web/.env.production`

```env
# API Configuration
VITE_API_URL=https://api.moovr.taxi

# Firebase
VITE_FIREBASE_PROJECT_ID=moovr-73876
VITE_FIREBASE_API_KEY=AIzaSyD... (get from Firebase Console)
VITE_FIREBASE_AUTH_DOMAIN=moovr-73876.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://moovr-73876.firebaseio.com
VITE_FIREBASE_STORAGE_BUCKET=moovr-73876.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdefg1234567890abcd

# Google Maps (get from Google Cloud Console)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Stripe (if using)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key

# App Configuration
VITE_APP_NAME=Moovr
VITE_APP_ENVIRONMENT=production
```

### 2.3 Admin Panel Environment (.env.local)

**File:** `admin-panel/.env.local`

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.moovr.taxi
API_URL=https://api.moovr.taxi

# Firebase
NEXT_PUBLIC_FIREBASE_PROJECT_ID=moovr-73876
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD... (same as frontend)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=moovr-73876.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=moovr-73876.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdefg1234567890abcd

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Next.js Configuration
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://admin.moovr.taxi
```

---

## Phase 3: SSL Certificate Setup (Let's Encrypt)

### 3.1 Install Certbot (SSH into your VPS)

```bash
# Connect to your VPS
ssh root@your_vps_ip

# Install Certbot
apt install -y certbot python3-certbot-nginx
```

### 3.2 Get SSL Certificates for All Subdomains

```bash
# Get certificates for all subdomains at once
sudo certbot certonly --nginx -d moovr.taxi -d www.moovr.taxi -d api.moovr.taxi -d admin.moovr.taxi

# Follow the prompts:
# 1. Enter your email (for certificate renewal notifications)
# 2. Agree to terms of service (A for Yes)
# 3. Choose whether to share email with EFF (Y/N)
```

**Certificates will be saved at:**
- `/etc/letsencrypt/live/moovr.taxi/fullchain.pem`
- `/etc/letsencrypt/live/moovr.taxi/privkey.pem`

✅ **Let's Encrypt certificates auto-renew every 90 days**

---

## Phase 4: Nginx Configuration

### 4.1 Create Nginx Config Files (On VPS)

Create three Nginx configuration files based on templates in **NGINX_CONFIGS.md**:

```bash
# Create frontend config
sudo nano /etc/nginx/sites-available/moovr-web
# Copy content from NGINX_CONFIGS.md → File 1

# Create API backend config
sudo nano /etc/nginx/sites-available/moovr-api
# Copy content from NGINX_CONFIGS.md → File 2

# Create admin panel config
sudo nano /etc/nginx/sites-available/moovr-admin
# Copy content from NGINX_CONFIGS.md → File 3
```

### 4.2 Enable Nginx Sites

```bash
# Enable all three sites
sudo ln -s /etc/nginx/sites-available/moovr-web /etc/nginx/sites-enabled/moovr-web
sudo ln -s /etc/nginx/sites-available/moovr-api /etc/nginx/sites-enabled/moovr-api
sudo ln -s /etc/nginx/sites-available/moovr-admin /etc/nginx/sites-enabled/moovr-admin

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 4.3 Configure Nginx for Socket.io (Already Updated)

The Socket.io CORS configuration in `moovr-backend/socket.js` has been updated to include:
```javascript
cors: {
  origin: [
    "https://moovr.taxi",
    "https://www.moovr.taxi",
    "https://admin.moovr.taxi",
    "http://localhost:5173",
    "http://localhost:5175",
    "http://localhost:3000",
    "http://localhost:3001"
  ],
  methods: ["GET", "POST"],
  credentials: true,
}
```

---

## Phase 5: Application Deployment

### 5.1 Clone and Setup Backend

```bash
# On VPS, in your home directory
cd ~

# Clone your project (assuming GitHub)
git clone https://github.com/your_username/odare.git
cd odare/moovr-backend

# Install dependencies
npm install

# Copy Firebase key file
# (Make sure moovr-73876-firebase-adminsdk-fbsvc-911ab2686e.json is in this directory)

# Create .env file with the values from Phase 2.1 above
nano .env
# Paste your environment variables

# Build/prepare if needed
npm run build  # (if your package.json has a build script)
```

### 5.2 Setup Backend with PM2

```bash
# While in moovr-backend directory

# Start the backend with PM2
pm2 start index.js --name "moovr-backend" --env production

# Create an ecosystem.config.js for easier management
pm2 save

# Make PM2 start on system reboot
pm2 startup
# (Follow the command it outputs)

# Check status
pm2 status
pm2 logs moovr-backend
```

### 5.3 Build and Deploy Frontend

```bash
# Go to frontend directory
cd ~/odare/moovr-web

# Install dependencies
npm install

# Create .env.production file with Phase 2.2 values
nano .env.production

# Build for production
npm run build

# The output will be in ./dist directory
# This is already configured in Nginx as root directory
```

### 5.4 Deploy Admin Panel

```bash
# Go to admin panel directory
cd ~/odare/admin-panel

# Install dependencies
npm install

# Create .env.local file with Phase 2.3 values
nano .env.local

# Build Next.js
npm run build

# Start with PM2
pm2 start "npm start" --name "moovr-admin" --env production

# Or use Next.js built-in production server:
pm2 start "node .next/standalone/server.js" --name "moovr-admin"

# Check status
pm2 logs moovr-admin
```

---

## Phase 6: Testing & Verification

### 6.1 Test DNS Resolution

```bash
# From your local machine:
nslookup moovr.taxi
nslookup api.moovr.taxi
nslookup admin.moovr.taxi

# All should return your VPS IP
```

### 6.2 Test HTTPS/SSL

```bash
# Check if SSL certificates are working
curl -I https://moovr.taxi
curl -I https://api.moovr.taxi
curl -I https://admin.moovr.taxi

# Should show "HTTP/2 200" or similar (not SSL errors)
```

### 6.3 Test Frontend Access

1. Open browser and go to `https://moovr.taxi`
2. You should see the Moovr application
3. Check browser console for any API errors (F12 → Console)
4. Test login/signup flows

### 6.4 Test API Backend

```bash
# Test API endpoint
curl https://api.moovr.taxi/api/v1/health

# Or use your API client:
# GET https://api.moovr.taxi/api/v1/health
```

### 6.5 Test Admin Panel

1. Open browser and go to `https://admin.moovr.taxi`
2. Admin panel should load
3. Test admin login

### 6.6 Test Socket.io Connection

In browser console at https://moovr.taxi:
```javascript
// Check if socket is connected
console.log(socket.connected); // Should be true

// In Network tab, look for WebSocket connections to api.moovr.taxi
```

---

## Phase 7: Monitoring & Maintenance

### 7.1 Monitor Processes

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs moovr-backend --lines 50
pm2 logs moovr-admin --lines 50

# Monitor in real-time
pm2 monit
```

### 7.2 SSL Certificate Renewal

```bash
# Manually test renewal (doesn't actually renew)
sudo certbot renew --dry-run

# Auto-renewal runs via cron job (usually installed automatically)
# Check renewal status:
sudo certbot certificates
```

### 7.3 Nginx Logs

```bash
# Check Nginx access logs
tail -f /var/log/nginx/moovr-web-access.log
tail -f /var/log/nginx/moovr-api-access.log
tail -f /var/log/nginx/moovr-admin-access.log

# Check Nginx error logs
tail -f /var/log/nginx/moovr-web-error.log
tail -f /var/log/nginx/moovr-api-error.log
tail -f /var/log/nginx/moovr-admin-error.log
```

---

## Troubleshooting

### Issue: DNS not resolving

**Solution:**
```bash
# Wait 24-48 hours for propagation
# Flush local DNS cache:
# On Windows PowerShell:
ipconfig /flushdns

# On Mac:
sudo dscacheutil -flushcache

# On Linux:
sudo systemctl restart systemd-resolved
```

### Issue: SSL Certificate Error

**Solution:**
```bash
# Check certificate status
sudo certbot certificates

# Renew manually
sudo certbot renew --force-renewal

# Check Nginx SSL configuration
sudo nginx -t
```

### Issue: Socket.io Connection Failing

**Solution:**
1. Check browser console for WebSocket errors
2. Verify Socket.io CORS in `moovr-backend/socket.js` includes moovr.taxi
3. Restart backend: `pm2 restart moovr-backend`
4. Check backend logs: `pm2 logs moovr-backend`

### Issue: Frontend API Calls Failing

**Solution:**
1. Check that `VITE_API_URL=https://api.moovr.taxi` in `.env.production`
2. Rebuild frontend: `npm run build`
3. Check network tab in browser DevTools
4. Verify backend logs: `pm2 logs moovr-backend`

### Issue: Admin Panel Not Loading

**Solution:**
1. Check that `NEXT_PUBLIC_API_URL=https://api.moovr.taxi` in `.env.local`
2. Restart admin process: `pm2 restart moovr-admin`
3. Check admin logs: `pm2 logs moovr-admin`

---

## Rollback/Emergency

### If something breaks and you need to rollback:

```bash
# Stop all services
pm2 stop all

# Restore from backup
cd ~/odare
git fetch origin
git checkout main  # or your last stable branch

# Restart services
pm2 start all

# Check status
pm2 status
```

---

## Next Steps

1. ✅ Update all environment files (Phase 2)
2. ✅ Configure DNS at Hostinger (Phase 1)
3. ✅ Setup SSL with Let's Encrypt (Phase 3)
4. ✅ Deploy Nginx configs (Phase 4)
5. ✅ Deploy applications (Phase 5)
6. ✅ Run verification tests (Phase 6)
7. ✅ Monitor and maintain (Phase 7)

**Estimated Setup Time:** 1-2 hours (including DNS propagation wait)

---

## Support

For detailed deployment information, see:
- **HOSTINGER_DEPLOYMENT_GUIDE.md** - General Hostinger setup
- **NGINX_CONFIGS.md** - Nginx configuration templates
- **ENV_TEMPLATES.md** - Environment variable templates
- **DEPLOYMENT_TROUBLESHOOTING.md** - Additional troubleshooting

---

**Last Updated:** 2024
**Domain:** moovr.taxi
**Status:** Ready for deployment ✅
