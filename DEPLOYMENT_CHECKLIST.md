# Quick Deployment Checklist - Hostinger

## Before You Start
- [ ] Have Hostinger login ready
- [ ] Have domain name ready
- [ ] Know your server IP address
- [ ] Have SSH access credentials

---

## Phase 1: Server Setup (30 minutes)

### 1.1 Initial Access
- [ ] SSH into server: `ssh root@your_server_ip`
- [ ] Update server: `apt update && apt upgrade -y`
- [ ] Install Node.js: `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && apt install -y nodejs`
- [ ] Install git: `apt install -y git npm curl wget pm2`

### 1.2 Verify Installations
```bash
node -v          # Should show v18.x or higher
npm -v           # Should show 9.x or higher
git --version    # Should show git version
```

---

## Phase 2: Project Deployment (1 hour)

### 2.1 Clone Repository
```bash
cd /home/username
git clone https://github.com/your-repo/odare.git
cd odare
ls -la  # Verify folder structure
```

### 2.2 Backend Setup
```bash
cd moovr-backend
npm install --production

# Create .env file
nano .env
# Add content from BACKEND_ENV_TEMPLATE.md
# Save: Ctrl+X → Y → Enter

# Test
npm start
# Should show "Server running on port 5000"
# Stop with Ctrl+C
```

### 2.3 Frontend Setup
```bash
cd ../moovr-web
npm install
npm run build
# Check if "dist" folder was created
ls -la dist
```

### 2.4 Admin Panel Setup
```bash
cd ../admin-panel
npm install
npm run build
# Check if ".next" folder was created
ls -la .next
```

---

## Phase 3: Process Management (30 minutes)

### 3.1 Setup Backend with PM2
```bash
cd /home/username/odare/moovr-backend

# Create ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: "moovr-api",
    script: "./index.js",
    instances: "max",
    exec_mode: "cluster",
    env: { NODE_ENV: "production" },
    error_file: "./logs/err.log",
    out_file: "./logs/out.log"
  }]
};
EOF

mkdir -p logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup
# Follow instructions from pm2 startup
```

### 3.2 Setup Admin Panel with PM2
```bash
cd /home/username/odare/admin-panel

cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: "moovr-admin",
    script: "npm",
    args: "start",
    instances: 2,
    exec_mode: "cluster",
    env: { NODE_ENV: "production", PORT: 3000 },
    error_file: "./logs/err.log"
  }]
};
EOF

mkdir -p logs
pm2 start ecosystem.config.js
```

---

## Phase 4: Nginx Setup (30 minutes)

### 4.1 Install Nginx
```bash
apt install -y nginx
```

### 4.2 Create Frontend Config
```bash
nano /etc/nginx/sites-available/moovr-web
```
**Copy content from NGINX_FRONTEND_CONFIG.conf**

### 4.3 Create API Config
```bash
nano /etc/nginx/sites-available/moovr-api
```
**Copy content from NGINX_API_CONFIG.conf**

### 4.4 Create Admin Config
```bash
nano /etc/nginx/sites-available/moovr-admin
```
**Copy content from NGINX_ADMIN_CONFIG.conf**

### 4.5 Enable All Configs
```bash
ln -s /etc/nginx/sites-available/moovr-web /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/moovr-api /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/moovr-admin /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Test and restart
nginx -t
systemctl restart nginx
```

---

## Phase 5: SSL & HTTPS (30 minutes)

### 5.1 Install Certbot
```bash
apt install -y certbot python3-certbot-nginx
```

### 5.2 Generate Certificates
```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
certbot --nginx -d api.yourdomain.com
certbot --nginx -d admin.yourdomain.com
```

### 5.3 Auto-Renew
```bash
systemctl enable certbot.timer
systemctl start certbot.timer
certbot renew --dry-run  # Test renewal
```

---

## Phase 6: Domain Configuration (5-10 minutes)

### 6.1 Update DNS at Hostinger

Go to: Hostinger → Domains → Your Domain → DNS Records

**Add/Update these records:**

```
Type | Name     | Value
-----|----------|--------
A    | @        | YOUR_SERVER_IP
A    | www      | YOUR_SERVER_IP
A    | api      | YOUR_SERVER_IP
A    | admin    | YOUR_SERVER_IP
```

**Note:** DNS propagation takes 24-48 hours

---

## Phase 7: Database Setup (15 minutes)

### Option A: MongoDB Atlas (Recommended)
- [ ] Create account at mongodb.com/cloud/atlas
- [ ] Create free cluster
- [ ] Get connection string
- [ ] Add server IP to whitelist
- [ ] Update backend `.env` with connection string

### Option B: Local MongoDB
```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-5.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-5.0.list
apt update
apt install -y mongodb-org
systemctl enable mongod
systemctl start mongod
```

---

## Phase 8: Firebase Setup (10 minutes)

### 8.1 Download Credentials
1. Go to Firebase Console
2. Select your project
3. Settings → Service Accounts
4. Generate new private key (JSON)
5. Download file

### 8.2 Upload to Server
```bash
# From your local machine
scp /path/to/moovr-73876-firebase-adminsdk-*.json root@your_server_ip:/home/username/odare/moovr-backend/

# On server
chmod 600 /home/username/odare/moovr-backend/moovr-73876-firebase-adminsdk-*.json
```

---

## Phase 9: Verification Tests (15 minutes)

### 9.1 Service Status
```bash
pm2 status
systemctl status nginx
systemctl status mongod  # If local MongoDB
```

### 9.2 Check Listening Ports
```bash
netstat -tlnp | grep LISTEN
# Should show:
# - nginx on port 80, 443
# - node on port 5000
# - node on port 3000
```

### 9.3 Test APIs
```bash
# Test frontend
curl -I http://yourdomain.com

# Test API proxy
curl -I http://api.yourdomain.com/health

# Test admin
curl -I http://admin.yourdomain.com
```

### 9.4 Browser Testing
- [ ] Open `https://yourdomain.com` - should load frontend
- [ ] Open `https://admin.yourdomain.com` - should load admin panel
- [ ] Check console for any errors (F12)
- [ ] Test Socket.io connection (Network tab, look for WebSocket)

---

## Phase 10: Firewall Configuration (10 minutes)

```bash
# Enable firewall
ufw enable

# Allow SSH (IMPORTANT!)
ufw allow 22/tcp

# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Allow internal services (optional, if external access needed)
# ufw allow 5000/tcp  # Backend (not recommended)
# ufw allow 3000/tcp  # Admin (not recommended)

# Check status
ufw status
```

---

## Phase 11: Monitoring & Logging

### 11.1 View Logs
```bash
pm2 logs moovr-api       # Backend logs
pm2 logs moovr-admin     # Admin logs
tail -f /var/log/nginx/error.log  # Nginx errors
tail -f /var/log/nginx/access.log  # Nginx access
```

### 11.2 Real-time Monitoring
```bash
pm2 monit  # Real-time CPU/memory monitoring
```

### 11.3 Setup Log Rotation
```bash
# PM2 already handles log rotation
# For Nginx, logs rotate automatically

# Check PM2 logs location
pm2 logs --lines 100  # Last 100 lines
```

---

## Phase 12: Post-Deployment

### 12.1 Backup Strategy
```bash
# Setup database backups
# Create backup script (daily)
cat > /home/username/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net" --out=/backups/mongo_$DATE
tar -czf /backups/project_$DATE.tar.gz /home/username/odare
echo "Backup completed: $DATE"
EOF

chmod +x /home/username/backup.sh

# Add to crontab for daily backups
crontab -e
# Add: 0 2 * * * /home/username/backup.sh
```

### 12.2 Email Configuration
Update `.env` with SMTP settings:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=app-specific-password
```

### 12.3 SMS Configuration (Twilio)
```env
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **502 Bad Gateway** | `systemctl restart nginx` + check backend logs |
| **Connection Refused** | Backend not running: `pm2 restart moovr-api` |
| **WebSocket Not Working** | Verify Nginx proxy headers (check NGINX_API_CONFIG.conf) |
| **DNS Not Resolving** | Wait 24-48 hours or check DNS records at Hostinger |
| **SSL Certificate Issue** | `certbot certificates` to check expiry |
| **High Memory Usage** | `pm2 restart moovr-api` + check logs for memory leaks |
| **Slow Response** | Check database connection + add Redis caching |

---

## Maintenance Commands

### Regular Updates
```bash
# Update system
apt update && apt upgrade -y

# Update Node.js packages
cd /home/username/odare/moovr-backend && npm update
cd /home/username/odare/admin-panel && npm update

# Restart apps
pm2 restart all
```

### Restart All Services
```bash
pm2 restart all
systemctl restart nginx
systemctl restart mongod  # If local
```

### Check Everything
```bash
pm2 status                              # App status
systemctl status nginx                  # Web server
systemctl status mongod                 # Database
netstat -tlnp | grep LISTEN            # All listening ports
curl -I https://api.yourdomain.com     # API health
```

---

## Emergency Commands

```bash
# Stop all apps
pm2 stop all

# Start all apps
pm2 start all

# Kill specific app
pm2 delete moovr-api

# Emergency restart backend
pm2 restart moovr-api --force

# Clear all PM2 processes
pm2 delete all

# Restart Nginx
systemctl restart nginx

# Check disk space
df -h

# Check memory
free -h

# Kill port if stuck
fuser -k 5000/tcp  # Kill whatever is using port 5000
```

---

## Success Indicators

✅ All checks should show "green":
```bash
pm2 status                              # All apps: online
systemctl is-active nginx               # active
ping yourdomain.com                     # getting replies
curl https://yourdomain.com             # HTTP 200
curl https://api.yourdomain.com/health  # HTTP 200
```

---

## Final Verification Checklist

- [ ] Frontend loads at https://yourdomain.com
- [ ] Admin panel loads at https://admin.yourdomain.com
- [ ] API responds at https://api.yourdomain.com
- [ ] SSL certificates valid (green lock icon)
- [ ] No console errors in browser (F12)
- [ ] WebSocket connection working (check Network tab)
- [ ] Database connected and accessible
- [ ] Firebase integration working
- [ ] Emails sending correctly
- [ ] SMS alerts working
- [ ] Emergency sounds playing
- [ ] All features functional

---

## Next: Monitor & Scale

Once deployment is successful:
1. Monitor logs daily
2. Setup uptime monitoring (UptimeRobot, Pingdom)
3. Plan regular backups
4. Consider CDN for frontend (Cloudflare)
5. Setup analytics
6. Plan scaling strategy

---

**Total Deployment Time: 4-5 hours (first time)**

Subsequent deployments: 30 minutes (updates only)
