# Deployment Troubleshooting Guide

## Quick Diagnostic Commands

### Check All Services Status
```bash
#!/bin/bash
echo "=== Checking Moovr Deployment Status ==="
echo ""
echo "PM2 Apps:"
pm2 status
echo ""
echo "Nginx:"
systemctl status nginx
echo ""
echo "MongoDB:"
systemctl status mongod
echo ""
echo "Listening Ports:"
netstat -tlnp | grep LISTEN
echo ""
echo "Disk Space:"
df -h
echo ""
echo "Memory:"
free -h
echo ""
echo "CPU Load:"
uptime
```

---

## Common Issues & Solutions

### 1. 502 Bad Gateway

**Symptoms:** Browser shows "502 Bad Gateway" error

**Causes & Solutions:**

```bash
# Check if backend is running
pm2 status
# If status shows "stopped", start it:
pm2 restart moovr-api

# Check if backend is listening on port 5000
lsof -i :5000
# If nothing shows, check logs:
pm2 logs moovr-api

# Check Nginx proxy configuration
grep "proxy_pass" /etc/nginx/sites-available/moovr-api
# Should show: proxy_pass http://moovr_backend;

# Check if port 5000 is blocked by firewall
ufw status
ufw allow 5000/tcp

# Restart Nginx
systemctl restart nginx

# Test backend directly
curl http://localhost:5000
# If connection refused, backend is down
```

### 2. Connection Refused / Backend Not Accessible

**Symptoms:** Cannot connect to API, WebSocket fails

**Causes & Solutions:**

```bash
# Check if Node.js is installed
node -v
npm -v

# Check if backend dependencies installed
cd /home/username/odare/moovr-backend
npm list  # See if packages installed

# Check .env file exists
cat .env  # Should show configuration

# Check MongoDB connection
# In .env, verify MONGODB_URI is correct
cat .env | grep MONGODB

# Test backend directly
npm start
# Should show: "Server running on port 5000"

# Check for syntax errors
node -c index.js  # Syntax check

# If still failing, check detailed logs
pm2 logs moovr-api --lines 100
```

### 3. WebSocket Connection Failing

**Symptoms:** Real-time features not working, Socket.io disconnected

**Causes & Solutions:**

```bash
# Check Nginx has WebSocket upgrade headers
grep -A5 "Upgrade" /etc/nginx/sites-available/moovr-api
# Should show:
# proxy_set_header Upgrade $http_upgrade;
# proxy_set_header Connection "upgrade";

# Check browser console (F12) for errors
# Look for: WebSocket connection failed

# Verify frontend is using correct API URL
grep VITE_API_URL /home/username/odare/moovr-web/.env.production
# Should be: https://api.yourdomain.com (not http, must be https)

# Test WebSocket connection
# In browser console:
// const socket = io('https://api.yourdomain.com');
// socket.on('connect', () => console.log('Connected!'));

# Check CORS settings in backend
grep -r "CORS_ORIGIN" /home/username/odare/moovr-backend/.env

# Restart backend
pm2 restart moovr-api
```

### 4. Frontend Not Loading / Blank Page

**Symptoms:** Browser shows blank page, 404 error

**Causes & Solutions:**

```bash
# Check if build files exist
ls -la /home/username/odare/moovr-web/dist/
# Should show index.html, JS, CSS files

# If dist/ is empty, rebuild:
cd /home/username/odare/moovr-web
npm run build

# Check Nginx configuration
cat /etc/nginx/sites-available/moovr-web
# Should have: root /home/username/odare/moovr-web/dist;

# Check permissions
ls -la /home/username/odare/moovr-web/ | grep dist
# dist folder should be readable

# Fix permissions if needed
chmod -R 755 /home/username/odare/moovr-web/dist

# Check Nginx error logs
tail -f /var/log/nginx/moovr-web-error.log

# Restart Nginx
systemctl restart nginx

# Test from command line
curl -I https://yourdomain.com
# Should show: HTTP/2 200

# Clear browser cache
# Ctrl+Shift+Delete in Chrome
# Or Cmd+Shift+Delete on Mac
```

### 5. SSL Certificate Issues

**Symptoms:** HTTPS not working, mixed content warnings

**Causes & Solutions:**

```bash
# Check certificate status
certbot certificates
# Should show all certificates with expiry dates

# Check certificate files exist
ls -la /etc/letsencrypt/live/yourdomain.com/
# Should show: fullchain.pem, privkey.pem

# Renew certificates manually
certbot renew

# Test certificate
openssl s_client -connect yourdomain.com:443

# Fix mixed content (frontend loads HTTP resources)
# In frontend build, check for hardcoded http:// URLs
grep -r "http://" /home/username/odare/moovr-web/src/
# Change to https:// or use protocol-relative URLs

# Restart Nginx
systemctl restart nginx
```

### 6. Database Connection Failed

**Symptoms:** Cannot save data, database errors in logs

**Causes & Solutions:**

```bash
# Check MongoDB is running
systemctl status mongod  # If local
# OR
# Verify MongoDB Atlas connection URL in .env

# Test connection string
# Copy MONGODB_URI from .env
cat .env | grep MONGODB

# If using MongoDB Atlas:
# 1. Check cluster is running in MongoDB Atlas
# 2. Check server IP is whitelisted
# 3. Check connection string includes username:password

# If using local MongoDB:
systemctl start mongod
systemctl enable mongod

# Test connection
mongo --version
# Or with newer version: mongosh --version

# Check backend logs
pm2 logs moovr-api | grep -i "mongo\|database\|connection"

# Restart backend
pm2 restart moovr-api
```

### 7. Email/SMS Not Sending

**Symptoms:** Notifications not received, emails bouncing

**Causes & Solutions:**

```bash
# Check SMTP configuration
cat .env | grep SMTP
# Should show: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS

# Test SMTP credentials
# For Gmail, verify:
# 1. 2-factor authentication is enabled
# 2. App-specific password generated (not account password)
# 3. Less secure app access is disabled (use app password instead)

# Check Twilio configuration
cat .env | grep TWILIO
# Should show: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER

# Check logs for email errors
pm2 logs moovr-api | grep -i "email\|smtp\|mail"

# Restart backend
pm2 restart moovr-api

# Test email from backend
# Add test endpoint and call it, or check admin panel
```

### 8. High Memory Usage

**Symptoms:** Server becoming slow, OOM (Out of Memory) errors

**Causes & Solutions:**

```bash
# Check memory usage
free -h
# or
top -b -n 1 | head -20

# Check which process uses most memory
ps aux --sort=-%mem | head

# Check PM2 memory
pm2 monit  # Real-time monitoring

# Stop all PM2 apps
pm2 stop all

# Increase Node.js memory limit (in PM2 config)
nano /home/username/odare/moovr-backend/ecosystem.config.js
# Add to app config:
# max_memory_restart: '500M',
# env: { NODE_OPTIONS: '--max_old_space_size=500' }

# Restart apps
pm2 restart all

# Check for memory leaks in code
pm2 logs moovr-api | tail -100  # Look for recurring errors

# Upgrade server if needed (scale up resources)
```

### 9. Domain Not Resolving / DNS Issues

**Symptoms:** Cannot access domain, DNS lookup failed

**Causes & Solutions:**

```bash
# Check DNS records
nslookup yourdomain.com
# or
dig yourdomain.com

# Check if records point to correct IP
# Should show your Hostinger server IP

# Wait for DNS propagation
# DNS changes take 24-48 hours to fully propagate
# Use https://dnschecker.org to check global DNS

# If urgent, edit local hosts file to test:
# Windows: C:\Windows\System32\drivers\etc\hosts
# Linux/Mac: /etc/hosts
# Add: your_server_ip yourdomain.com

# Verify Nginx is listening
netstat -tlnp | grep :80
netstat -tlnp | grep :443

# Test domain locally
curl yourdomain.com
curl https://yourdomain.com
```

### 10. Admin Panel Not Loading

**Symptoms:** Admin dashboard blank, 404 on admin.yourdomain.com

**Causes & Solutions:**

```bash
# Check if Next.js app is running
pm2 status moovr-admin
# If stopped:
pm2 restart moovr-admin

# Check port 3000 is listening
lsof -i :3000

# Check Nginx admin config
cat /etc/nginx/sites-available/moovr-admin
# Should have: proxy_pass http://127.0.0.1:3000;

# Verify admin app built successfully
ls -la /home/username/odare/admin-panel/.next/
# Should have files in this directory

# Check admin logs
pm2 logs moovr-admin | tail -50

# Rebuild admin panel
cd /home/username/odare/admin-panel
npm install
npm run build

# Restart
pm2 restart moovr-admin
```

---

## Performance Optimization Tips

### 1. Enable Compression
```bash
# Already enabled in Nginx configs
# Verify with:
curl -I -H "Accept-Encoding: gzip" https://yourdomain.com
# Should show: Content-Encoding: gzip
```

### 2. Enable Caching
```bash
# For static assets - already configured
# Verify:
curl -I https://yourdomain.com/main.js
# Should show: Cache-Control: public, immutable
```

### 3. Add CDN (Cloudflare)
```bash
# Create Cloudflare account
# Add your domain
# Update nameservers in Hostinger to Cloudflare's
# Enable auto-HTTPS, compression, caching
```

### 4. Optimize Database
```bash
# Add indexes to frequently queried fields
# Use MongoDB Atlas for better performance
# Set up automated backups
```

### 5. Monitor & Alert
```bash
# Setup monitoring with:
# - pm2 plus (for app monitoring)
# - UptimeRobot (for uptime monitoring)
# - Loggly/Papertrail (for log aggregation)
```

---

## Useful Commands Reference

```bash
# Service Management
pm2 status                          # See all apps
pm2 logs moovr-api                  # Stream backend logs
pm2 logs moovr-admin                # Stream admin logs
pm2 stop all                        # Stop all apps
pm2 start all                       # Start all apps
pm2 restart all                     # Restart all apps
pm2 delete all                      # Delete all apps
pm2 save                            # Save PM2 state

# Nginx
systemctl restart nginx             # Restart web server
systemctl reload nginx              # Reload config (no interruption)
nginx -t                            # Test configuration
tail -f /var/log/nginx/error.log   # Watch error log
tail -f /var/log/nginx/access.log  # Watch access log

# System
df -h                               # Disk space
free -h                             # Memory
top                                 # Process monitor
netstat -tlnp                       # Listening ports
ps aux | grep node                  # Find Node processes

# Database
systemctl status mongod             # MongoDB status
mongo                               # Connect to MongoDB
show dbs                            # List databases
use moovr_db                        # Select database
db.users.count()                    # Count users

# Git
git status                          # See changes
git pull                            # Update code
git log --oneline -5                # Recent commits

# Environment
cat .env                            # View config
echo "VALUE" > .env                 # Set variable
source .env                         # Load environment

# Testing
curl -I https://yourdomain.com                    # Test frontend
curl https://api.yourdomain.com/health            # Test API
curl https://admin.yourdomain.com                 # Test admin
```

---

## Emergency Procedures

### If Backend Crashes
```bash
pm2 restart moovr-api
pm2 logs moovr-api  # Check what went wrong
```

### If Nginx Crashes
```bash
systemctl restart nginx
nginx -t  # Verify config is correct
```

### If Database Is Down
```bash
# Check connection
# Restart if local: systemctl restart mongod
# Or verify Atlas cluster is running

pm2 restart moovr-api  # Restart app after DB recovers
```

### If Server Runs Out of Disk Space
```bash
df -h  # See which partition is full
du -sh /* | sort -h  # See what's using space
# Clear old logs: rm -rf /var/log/*.gz
# Clear old npm cache: npm cache clean --force
```

### If All Services Are Down
```bash
# SSH into server
ssh root@your_server_ip

# Start everything
pm2 start all
systemctl start nginx
systemctl start mongod

# Verify
pm2 status
systemctl status nginx
systemctl status mongod
```

---

## When to Upgrade Server

Consider upgrading if:
- [ ] Memory usage consistently > 80%
- [ ] CPU usage consistently > 80%
- [ ] Disk space < 20% available
- [ ] Response time > 1 second
- [ ] Regular OOM (Out of Memory) errors
- [ ] Growing user base (scale early)

---

## Support Resources

- Hostinger Support: https://www.hostinger.com/help
- Nginx Documentation: https://nginx.org/en/docs/
- PM2 Documentation: https://pm2.keymetrics.io/docs
- Node.js Docs: https://nodejs.org/docs/
- MongoDB Docs: https://docs.mongodb.com/
- Let's Encrypt: https://letsencrypt.org/support/
- Twilio Docs: https://www.twilio.com/docs
- Firebase Docs: https://firebase.google.com/docs

---

## Before Contacting Support

Have ready:
1. Output of `pm2 status`
2. Output of `systemctl status nginx`
3. Last 50 lines of error log: `pm2 logs moovr-api | tail -50`
4. Error message from browser console (F12)
5. Network tab showing failed requests
6. Output of `free -h` and `df -h`
7. Recent git changes: `git log --oneline -5`

This helps support diagnose issues faster!
