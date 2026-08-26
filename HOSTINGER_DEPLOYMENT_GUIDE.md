# Moovr Deployment Guide - Hostinger

## Project Architecture Overview

Your project has 3 applications:
1. **moovr-web** - React/Vite frontend (SPA)
2. **moovr-backend** - Node.js/Express API with Socket.io
3. **admin-panel** - Next.js admin dashboard

Plus Firebase integration for storage and cloud functions.

---

## Step 1: Prerequisites & Hostinger Setup

### 1.1 Hostinger Plan Requirements

**Recommended Plan**: Hostinger Business/Premium VPS or Managed Cloud
- Minimum 2GB RAM
- Node.js support
- SSH access
- SSL certificate (usually included)

❌ **NOT Recommended**: Shared hosting (limited Node.js support)

### 1.2 Domain Setup in Hostinger
1. Go to Hostinger > Domains > Your Domain
2. Go to **DNS Records** section
3. Update nameservers to point to Hostinger (usually done automatically)
4. Add DNS records (we'll do this in Step 6)

### 1.3 Initial Server Setup
1. SSH into your Hostinger server:
```bash
ssh root@your_server_ip
# Or the username provided by Hostinger
```

2. Update server:
```bash
apt update && apt upgrade -y
```

3. Install Node.js (LTS):
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs
node -v  # Verify installation
```

4. Install other tools:
```bash
apt install -y git npm curl wget pm2
npm install -g pm2  # Process manager for Node.js
```

---

## Step 2: Prepare Your Project

### 2.1 Create Environment Files

**Backend .env** (`moovr-backend/.env`):
```env
# Server
PORT=5000
NODE_ENV=production
VITE_API_URL=https://api.yourdomain.com

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/moovr_db

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this

# Firebase
VITE_FIREBASE_PROJECT_ID=moovr-73876
FIREBASE_STORAGE_BUCKET=moovr-73876.firebasestorage.app
GOOGLE_APPLICATION_CREDENTIALS=./moovr-73876-firebase-adminsdk-fbsvc-911ab2686e.json

# Admin Alerts
ADMIN_ALERT_EMAIL=your-admin@email.com
ADMIN_ALERT_PHONE=+1234567890

# Stripe (if using)
STRIPE_SECRET_KEY=sk_live_xxxx

# Default Emergency Number
DEFAULT_EMERGENCY_NUMBER=911

# CORS
CORS_ORIGIN=https://yourdomain.com,https://admin.yourdomain.com
```

**Frontend .env** (`moovr-web/.env.production`):
```env
VITE_API_URL=https://api.yourdomain.com
VITE_FIREBASE_PROJECT_ID=moovr-73876
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=moovr-73876.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=moovr-73876.firebasestorage.app
```

For Coolify, add these `VITE_*` variables to the frontend application's
Environment Variables before clicking Redeploy. They must be available during
the `npm run build` step; adding them after the build does not update a Vite bundle.

**Admin Panel .env.local** (`admin-panel/.env.local`):
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### 2.2 Update Backend Configuration
Edit `moovr-backend/socket.js` to allow your domain:

```javascript
const io = require("socket.io")(server, {
  cors: {
    origin: [
      "https://yourdomain.com",
      "https://admin.yourdomain.com",
      "http://localhost:3000", // Keep for development
      "http://localhost:5173",  // Keep for development
    ],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});
```

---

## Step 3: Deploy Backend (API Server)

### 3.1 Clone Project to Server
```bash
cd /home/username  # Navigate to your home directory
git clone https://github.com/your-repo/odare.git
cd odare/moovr-backend
```

### 3.2 Install Dependencies
```bash
npm install --production
```

### 3.3 Create Environment File
```bash
nano .env
# Paste the backend .env content from Step 2.1
# Save with Ctrl+X, then Y, then Enter
```

### 3.4 Test Backend Locally
```bash
npm start
# You should see: "Server running on port 5000"
# Press Ctrl+C to stop
```

### 3.5 Setup PM2 (Process Manager)
```bash
# Create PM2 config file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: "moovr-api",
    script: "./index.js",
    instances: "max",
    exec_mode: "cluster",
    env: {
      NODE_ENV: "production"
    },
    error_file: "./logs/err.log",
    out_file: "./logs/out.log",
    log_file: "./logs/combined.log",
    time_format: "YYYY-MM-DD HH:mm:ss Z"
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 config
pm2 save

# Start PM2 on reboot
pm2 startup
# Follow the instructions it gives
```

---

## Step 4: Deploy Frontend (React App)

### 4.1 Build Frontend
```bash
cd /home/username/odare/moovr-web
npm install
npm run build
# This creates a "dist" folder with optimized files
# Upload the contents of dist/ to public_html/ (not moovr-web/ or src/)
# dist/.htaccess is included for Apache MIME types and React Router fallback
```

### 4.2 Setup Nginx as Reverse Proxy

**Install Nginx:**
```bash
apt install -y nginx
```

**Create Nginx config for frontend:**
```bash
nano /etc/nginx/sites-available/moovr-web
```

**Paste this configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /home/username/odare/moovr-web/dist;
    
    # React Router SPA configuration
    location / {
        try_files $uri /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Enable the site:**
```bash
ln -s /etc/nginx/sites-available/moovr-web /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default  # Remove default config
nginx -t  # Test configuration
systemctl restart nginx
```

---

## Step 5: Deploy Admin Panel (Next.js)

### 5.1 Build Admin Panel
```bash
cd /home/username/odare/admin-panel
npm install
npm run build
```

### 5.2 Setup PM2 for Admin Panel
```bash
cat > /home/username/odare/admin-panel/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: "moovr-admin",
    script: "npm",
    args: "start",
    instances: 2,
    exec_mode: "cluster",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    },
    error_file: "./logs/err.log",
    out_file: "./logs/out.log"
  }]
};
EOF

cd /home/username/odare/admin-panel
mkdir -p logs
pm2 start ecosystem.config.js
```

### 5.3 Setup Nginx for Admin Panel
```bash
nano /etc/nginx/sites-available/moovr-admin
```

**Paste this configuration:**
```nginx
server {
    listen 80;
    server_name admin.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable it:**
```bash
ln -s /etc/nginx/sites-available/moovr-admin /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## Step 6: Setup API Backend with Nginx Proxy

### 6.1 Create Nginx Config for Backend
```bash
nano /etc/nginx/sites-available/moovr-api
```

**Paste this configuration:**
```nginx
upstream moovr_backend {
    server 127.0.0.1:5000;
}

server {
    listen 80;
    server_name api.yourdomain.com;
    
    client_max_body_size 100M;  # Allow large file uploads
    
    location / {
        proxy_pass http://moovr_backend;
        proxy_http_version 1.1;
        
        # WebSocket support (for Socket.io)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Keep the WebSocket connection open
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
    
    # Block access to sensitive files
    location ~ /\.env {
        deny all;
    }
}
```

**Enable it:**
```bash
ln -s /etc/nginx/sites-available/moovr-api /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## Step 7: Setup SSL Certificates

### 7.1 Using Hostinger's Free SSL (if available)

1. Go to Hostinger > Your Domain > SSL Certificate
2. Install free Hostinger SSL

### 7.2 OR Use Let's Encrypt (Free Alternative)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL for frontend
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Get SSL for API
certbot --nginx -d api.yourdomain.com

# Get SSL for Admin
certbot --nginx -d admin.yourdomain.com

# Auto-renew certificates
systemctl enable certbot.timer
systemctl start certbot.timer
```

---

## Step 8: Update DNS Records

Go to Hostinger > Domains > Your Domain > DNS Records

**Add these records:**

| Type | Name | Value |
|------|------|-------|
| A | @ | your_server_ip |
| A | www | your_server_ip |
| A | api | your_server_ip |
| A | admin | your_server_ip |
| CNAME | www | yourdomain.com |

**Example:**
- `yourdomain.com` → Points to your server IP
- `api.yourdomain.com` → Points to your server IP
- `admin.yourdomain.com` → Points to your server IP

DNS changes can take 24-48 hours to propagate.

---

## Step 9: MongoDB Setup

### 9.1 Option A: MongoDB Atlas (Recommended - Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account and cluster
3. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/moovr_db`
4. Add your server IP to IP whitelist (0.0.0.0/0 for any)
5. Update `.env` with connection string

### 9.2 Option B: Local MongoDB (If hosting on same server)

```bash
# Install MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-5.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-5.0.list
apt update
apt install -y mongodb-org

# Start MongoDB
systemctl start mongod
systemctl enable mongod

# Verify
mongo --version
```

---

## Step 10: Verification & Testing

### 10.1 Check Services Status
```bash
# Check backend API
curl https://api.yourdomain.com/health

# Check Nginx
systemctl status nginx

# Check PM2 apps
pm2 status

# Check logs
pm2 logs moovr-api
pm2 logs moovr-admin
```

### 10.2 Test Each Component

**Frontend** - Open browser:
```
https://yourdomain.com
```

**Admin Panel** - Open browser:
```
https://admin.yourdomain.com
```

**API** - Test with curl:
```bash
curl -X GET https://api.yourdomain.com/api/v1/users \
  -H "Authorization: Bearer your_token"
```

### 10.3 Monitor in Real-time
```bash
pm2 monit  # Real-time monitoring
pm2 logs   # View all logs
```

---

## Step 11: Firebase Setup

### 11.1 Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Settings > Service Accounts
4. Generate new private key (JSON file)
5. Upload to server:

```bash
# From your local machine
scp moovr-73876-firebase-adminsdk-fbsvc-911ab2686e.json \
    root@your_server_ip:/home/username/odare/moovr-backend/
```

6. Set proper permissions:
```bash
chmod 600 /home/username/odare/moovr-backend/moovr-73876-firebase-adminsdk-fbsvc-911ab2686e.json
```

---

## Step 12: Database Migrations (If Needed)

```bash
cd /home/username/odare/moovr-backend

# Create any necessary database collections/indexes
node scripts/migrate.js  # If you have migration scripts
```

---

## Step 13: Email & Notifications Setup

### 13.1 Setup SMTP for Emails
Update `.env` with your email provider credentials:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
```

### 13.2 SMS Setup (Twilio)
```env
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

---

## Troubleshooting

### Backend Not Connecting
```bash
# Check if port 5000 is listening
netstat -tlnp | grep 5000

# Check firewall
ufw allow 5000/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### Frontend Not Loading
```bash
# Check Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# Restart Nginx
systemctl restart nginx
```

### Socket.io Not Working
```bash
# Ensure WebSocket upgrade headers are set in Nginx
# Check browser console for errors
# Verify API URL in frontend matches proxy domain
```

### PM2 Not Starting Apps
```bash
pm2 delete all
pm2 start ecosystem.config.js --name moovr-api
pm2 logs moovr-api  # Check for errors
```

---

## Maintenance & Updates

### Update Backend Code
```bash
cd /home/username/odare/moovr-backend
git pull origin main
npm install
pm2 restart moovr-api
```

### Update Frontend
```bash
cd /home/username/odare/moovr-web
git pull origin main
npm run build
# Files are served from dist/
```

### Update Admin Panel
```bash
cd /home/username/odare/admin-panel
git pull origin main
npm install
npm run build
pm2 restart moovr-admin
```

### View Logs
```bash
pm2 logs moovr-api      # Backend
pm2 logs moovr-admin    # Admin panel
tail -f /var/log/nginx/error.log  # Nginx errors
```

---

## Security Best Practices

1. **SSH Keys** - Use SSH keys instead of passwords
2. **Firewall** - Only open necessary ports
3. **HTTPS** - Always use SSL certificates
4. **Environment Variables** - Never commit `.env` files
5. **Rate Limiting** - Add rate limiting in Nginx
6. **Backups** - Regular database backups
7. **Updates** - Keep Node.js and npm updated

---

## Performance Optimization

### Enable Gzip Compression
```bash
nano /etc/nginx/nginx.conf
# Add these lines in http block:
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss;
gzip_comp_level 6;
```

### Add Caching Headers
Already configured in Nginx for static assets (see Step 4.2)

### Enable Redis (Optional - For Session Caching)
```bash
apt install -y redis-server
systemctl enable redis-server
systemctl start redis-server
```

---

## Quick Deployment Checklist

- [ ] Server prerequisites installed (Node.js, npm, git, pm2, nginx)
- [ ] Project cloned to server
- [ ] Environment files (.env) created with correct values
- [ ] Backend built and tested locally
- [ ] Backend running with PM2
- [ ] Frontend built (npm run build)
- [ ] Nginx configured for all three apps
- [ ] SSL certificates installed
- [ ] DNS records updated
- [ ] Database connected (MongoDB Atlas or local)
- [ ] Firebase credentials uploaded
- [ ] All services tested and working
- [ ] Firewall rules configured
- [ ] Backups scheduled

---

## Support & Help

**Hostinger Support**: https://www.hostinger.com/help
**Nginx Docs**: https://nginx.org/en/docs/
**PM2 Docs**: https://pm2.keymetrics.io/docs
**Let's Encrypt**: https://letsencrypt.org/

---

## Next Steps

1. Complete setup following this guide
2. Test all endpoints thoroughly
3. Monitor logs for errors
4. Setup monitoring/alerts
5. Plan maintenance schedule
6. Consider CDN for frontend (Cloudflare, etc.)

Good luck with your deployment! 🚀
