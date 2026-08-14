# Hostinger Deployment - Quick Reference Card

## Pre-Deployment Checklist

```
SERVER ACCESS
□ SSH credentials ready: ssh root@your_server_ip
□ Hostinger domain pointing to server IP
□ Firewall allows ports: 22 (SSH), 80 (HTTP), 443 (HTTPS)

ENVIRONMENT
□ All .env files created with correct values
□ Firebase credentials ready
□ MongoDB connection string (Atlas or local)
□ Twilio/SMTP credentials ready

BUILD
□ Frontend: npm run build ✓
□ Admin: npm run build ✓
□ Backend: Dependencies installed ✓
□ All .env files: ✓
```

---

## Essential Commands

### Initial Server Setup
```bash
# 1. Connect to server
ssh root@your_server_ip

# 2. Update & install tools
apt update && apt upgrade -y
apt install -y nodejs git npm pm2 curl wget nginx

# 3. Verify installations
node -v && npm -v && nginx -v
```

### Deploy Backend
```bash
cd /home/username/odare/moovr-backend
npm install --production
nano .env          # Add configuration
npm start           # Test
pm2 start ecosystem.config.js
```

### Deploy Frontend
```bash
cd /home/username/odare/moovr-web
npm install
npm run build
# Files in /dist - Nginx serves them
```

### Deploy Admin
```bash
cd /home/username/odare/admin-panel
npm install
npm run build
pm2 start ecosystem.config.js
```

### Setup Nginx
```bash
# Copy config files from NGINX_CONFIGS.md
ln -s /etc/nginx/sites-available/moovr-* /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Get SSL Certificate
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com -d api.yourdomain.com -d admin.yourdomain.com
```

### Update DNS
```
Go to Hostinger > Domains > Your Domain > DNS
Add: A records pointing to your_server_ip for @, api, admin
```

---

## Deployment Time Breakdown

| Step | Time | Commands |
|------|------|----------|
| Server setup | 15 min | Update + install Node.js |
| Backend | 10 min | Clone + npm install + pm2 |
| Frontend | 10 min | npm install + npm run build |
| Admin | 10 min | npm install + npm run build |
| Nginx | 10 min | Create configs + enable |
| SSL | 10 min | certbot setup |
| DNS | 5 min | Update records at Hostinger |
| Test | 15 min | Verify all working |
| **TOTAL** | **~90 min** | First deployment |

---

## File Locations (Remember These!)

```
Backend:        /home/username/odare/moovr-backend
Frontend:       /home/username/odare/moovr-web/dist
Admin:          /home/username/odare/admin-panel

Nginx configs:  /etc/nginx/sites-available/moovr-*
Nginx logs:     /var/log/nginx/
PM2 logs:       pm2 logs [app-name]
SSL certs:      /etc/letsencrypt/live/yourdomain.com/
```

---

## Domain Mapping

```
yourdomain.com        → Frontend (React app)
api.yourdomain.com    → Backend (Node.js API + Socket.io)
admin.yourdomain.com  → Admin (Next.js dashboard)
```

---

## Services & Their Ports

| Service | Port | Type | Status |
|---------|------|------|--------|
| Nginx | 80, 443 | HTTP/HTTPS | systemctl status nginx |
| Backend | 5000 | Node.js | pm2 status |
| Admin | 3000 | Node.js | pm2 status |
| MongoDB | 27017 | Database | systemctl status mongod |

---

## Health Checks

```bash
# All working?
curl https://yourdomain.com              # HTTP 200
curl https://api.yourdomain.com          # HTTP 200
curl https://admin.yourdomain.com        # HTTP 200
pm2 status                                # All online

# Not working?
See TROUBLESHOOTING.md
```

---

## Common Commands (Bookmark These!)

```bash
# View everything
pm2 status                      # App status
pm2 logs moovr-api             # Backend logs
pm2 logs moovr-admin           # Admin logs
tail -f /var/log/nginx/error.log  # Nginx errors

# Restart something
pm2 restart moovr-api          # Restart backend
systemctl restart nginx        # Restart web server

# Stop everything
pm2 stop all
systemctl stop nginx

# Start everything
pm2 start all
systemctl start nginx

# Update code
cd /home/username/odare/moovr-web
git pull
npm run build
# (Nginx auto-serves new files)

# Check status
free -h                        # Memory
df -h                          # Disk
uptime                         # System uptime
netstat -tlnp | grep LISTEN    # Listening ports
```

---

## Troubleshooting Flowchart

```
Is frontend loading?
├─ YES: Is API responding?
│   ├─ YES: Check WebSocket (F12, Network)
│   │   ├─ WebSocket working? ✓ DONE
│   │   └─ WebSocket failing? → Check Nginx proxy_set_header
│   └─ NO: Backend down
│       └─ Run: pm2 restart moovr-api
└─ NO: Is Nginx running?
    ├─ YES: Check /home/username/odare/moovr-web/dist
    │   ├─ Exists? → nginx -t && systemctl restart nginx
    │   └─ Empty? → cd moovr-web && npm run build
    └─ NO: Run: systemctl restart nginx
```

---

## Critical Don'ts

❌ Don't commit .env files to git
❌ Don't use development keys in production
❌ Don't run pm2 start without ecosystem.config.js
❌ Don't edit /etc/nginx/nginx.conf (use sites-available)
❌ Don't forget SSL certificates (use Let's Encrypt)
❌ Don't use weak JWT secrets
❌ Don't expose sensitive files in Nginx (block .env)
❌ Don't deploy with NODE_ENV=development
❌ Don't forget to update DNS records
❌ Don't open unnecessary firewall ports

---

## Quick Help

| Problem | Command | Reference |
|---------|---------|-----------|
| Backend crash | `pm2 restart moovr-api` | TROUBLESHOOTING.md → Issue #2 |
| Frontend blank | `cd moovr-web && npm run build` | TROUBLESHOOTING.md → Issue #4 |
| No socket | Check Nginx config | NGINX_CONFIGS.md → File 2 |
| No SSL | `certbot --nginx -d ...` | HOSTINGER_DEPLOYMENT_GUIDE.md → Step 7 |
| DNS not working | Wait 24-48h or check records | HOSTINGER_DEPLOYMENT_GUIDE.md → Step 8 |
| Email not working | Check SMTP in .env | ENV_TEMPLATES.md → Backend section |
| Out of memory | `pm2 monit` | TROUBLESHOOTING.md → Issue #8 |
| 502 error | `pm2 logs moovr-api` | TROUBLESHOOTING.md → Issue #1 |

---

## Files You Created/Modified

| File | Purpose | Edit? |
|------|---------|-------|
| moovr-backend/.env | Backend config | YES - Replace placeholders |
| moovr-web/.env.production | Frontend config | YES - Replace placeholders |
| admin-panel/.env.local | Admin config | YES - Replace placeholders |
| /etc/nginx/sites-available/moovr-* | Web server config | YES - Replace domain |
| moovr-backend/ecosystem.config.js | PM2 config | Copy from guide |
| admin-panel/ecosystem.config.js | PM2 config | Copy from guide |

---

## Useful Links

- Hostinger Control Panel: https://hpanel.hostinger.com
- Firebase Console: https://console.firebase.google.com
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Certbot Documentation: https://certbot.eff.org
- Nginx Docs: https://nginx.org/en/docs
- PM2 Docs: https://pm2.keymetrics.io

---

## Post-Deployment (48+ hours later)

- [ ] DNS fully propagated (check with dnschecker.org)
- [ ] All features tested with real data
- [ ] Emails/SMS confirmed working
- [ ] Emergency alerts tested
- [ ] Socket.io connections stable
- [ ] Database backups automated
- [ ] SSL certificate auto-renewal confirmed
- [ ] Server monitoring setup (UptimeRobot, etc.)
- [ ] Log aggregation setup (optional)
- [ ] CDN configured (optional, Cloudflare)

---

## Keep This Next to You During Deployment

```
Server IP:              _________________
Username:               _________________
Domain:                 _________________
API Domain:             _________________
Admin Domain:           _________________
MongoDB URI:            _________________
Firebase Project ID:    _________________
Support Contact:        _________________
```

---

## If Everything Fails - Last Resort

```bash
# Full system restart (only if nothing works)
systemctl reboot

# Then:
pm2 start all
systemctl start nginx
systemctl start mongod

# Then monitor:
pm2 logs moovr-api
tail -f /var/log/nginx/error.log
```

**Before reboot:** Kill any hanging processes
```bash
pm2 kill
killall node
systemctl restart nginx
```

---

**Document created:** 2024-08-14
**Valid for:** Moovr project on Hostinger
**Update this when:** Node version changes, Nginx version changes, PM2 changes
