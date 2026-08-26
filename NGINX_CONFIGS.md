# Nginx Configuration Files

## File 1: Frontend Config
**Save as:** `/etc/nginx/sites-available/moovr-web`

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name moovr.taxi www.moovr.taxi;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name moovr.taxi www.moovr.taxi;
    
    # SSL Certificate Paths (Will be updated by Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/moovr.taxi/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/moovr.taxi/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Root directory - where Vite build output is
    root /home/username/odare/moovr-web/dist;
    
    # Default file
    index index.html;
    
    # Log files
    access_log /var/log/nginx/moovr-web-access.log;
    error_log /var/log/nginx/moovr-web-error.log;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_comp_level 6;
    gzip_vary on;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # React Router - Send all requests to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets (JS, CSS, images, etc.)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|otf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Don't cache index.html
    location = /index.html {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # Deny access to dotfiles
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # Deny access to .env files
    location ~ /\.env {
        deny all;
    }
}
```

---

## File 2: API Backend Config
**Save as:** `/etc/nginx/sites-available/moovr-api`

```nginx
# Upstream backend server
upstream moovr_backend {
    server 127.0.0.1:5000;
    keepalive 32;
}

server {
    listen 80;
    listen [::]:80;
    server_name api.moovr.taxi;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.moovr.taxi;
    
    # SSL Certificate Paths (Will be updated by Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/api.moovr.taxi/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.moovr.taxi/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Log files
    access_log /var/log/nginx/moovr-api-access.log;
    error_log /var/log/nginx/moovr-api-error.log;
    
    # Allow large file uploads (100MB)
    client_max_body_size 100M;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss;
    gzip_comp_level 6;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;
    
    location / {
        proxy_pass http://moovr_backend;
        proxy_http_version 1.1;
        
        # WebSocket upgrade (for Socket.io)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Pass headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # Timeouts (important for WebSocket)
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffering
        proxy_buffering off;
    }
    
    # Deny access to dotfiles
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # Deny access to .env file
    location ~ /\.env {
        deny all;
    }
    
    # Deny access to sensitive backend files
    location ~ /ecosystem.config.js {
        deny all;
    }
}
```

---

## File 3: Admin Panel Config
**Save as:** `/etc/nginx/sites-available/moovr-admin`

```nginx
# Upstream Next.js server
upstream moovr_admin {
    server 127.0.0.1:3000;
    keepalive 32;
}

server {
    listen 80;
    listen [::]:80;
    server_name admin.moovr.taxi;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name admin.moovr.taxi;
    
    # SSL Certificate Paths (Will be updated by Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/admin.moovr.taxi/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.moovr.taxi/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Log files
    access_log /var/log/nginx/moovr-admin-access.log;
    error_log /var/log/nginx/moovr-admin-error.log;
    
    # File size limits
    client_max_body_size 50M;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss;
    gzip_comp_level 6;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    
    # Rate limiting (admin panel)
    limit_req_zone $binary_remote_addr zone=admin_limit:10m rate=30r/s;
    limit_req zone=admin_limit burst=50 nodelay;
    
    location / {
        proxy_pass http://moovr_admin;
        proxy_http_version 1.1;
        
        # Pass headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Keep connection alive
        proxy_set_header Connection "";
    }
    
    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://moovr_admin;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Deny access to dotfiles
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # Deny access to environment files
    location ~ /\.env {
        deny all;
    }
}
```

---

## How to Use These Configs

### Step 1: Copy to Server
```bash
# SSH into server
ssh root@your_server_ip

# Create the config files (copy one config at a time)
nano /etc/nginx/sites-available/moovr-web
# Paste content from File 1
# Save: Ctrl+X → Y → Enter

nano /etc/nginx/sites-available/moovr-api
# Paste content from File 2
# Save: Ctrl+X → Y → Enter

nano /etc/nginx/sites-available/moovr-admin
# Paste content from File 3
# Save: Ctrl+X → Y → Enter
```

### Step 2: Replace Domain Names
```bash
# Replace yourdomain.com with your actual domain
sed -i 's/yourdomain.com/your-actual-domain.com/g' /etc/nginx/sites-available/moovr-web
sed -i 's/yourdomain.com/your-actual-domain.com/g' /etc/nginx/sites-available/moovr-api
sed -i 's/yourdomain.com/your-actual-domain.com/g' /etc/nginx/sites-available/moovr-admin

# Replace /home/username with your actual username
sed -i 's|/home/username|/home/your-username|g' /etc/nginx/sites-available/moovr-web
```

### Step 3: Enable Sites
```bash
# Create symlinks
ln -s /etc/nginx/sites-available/moovr-web /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/moovr-api /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/moovr-admin /etc/nginx/sites-enabled/

# Remove default config
rm /etc/nginx/sites-enabled/default

# Test configuration
nginx -t
# Should output: "nginx: the configuration file /etc/nginx/nginx.conf syntax is ok"

# Restart Nginx
systemctl restart nginx
```

### Step 4: Install SSL (Let's Encrypt)
```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get certificates for all domains
certbot --nginx -d yourdomain.com -d www.yourdomain.com
certbot --nginx -d api.yourdomain.com
certbot --nginx -d admin.yourdomain.com

# Auto-renew
systemctl enable certbot.timer
systemctl start certbot.timer
```

---

## Troubleshooting Nginx Configs

### Test a specific config
```bash
nginx -t -c /etc/nginx/sites-available/moovr-web
```

### View Nginx error logs
```bash
tail -f /var/log/nginx/error.log
```

### View Nginx access logs
```bash
tail -f /var/log/nginx/access.log
```

### Reload Nginx (without restart)
```bash
nginx -s reload
```

### Check listening ports
```bash
netstat -tlnp | grep nginx
```

### Common issues & fixes

**502 Bad Gateway:**
```bash
# Check if backend is running
pm2 status
pm2 restart moovr-api

# Check if port 5000 is listening
netstat -tlnp | grep 5000
```

**Connection Refused:**
```bash
# Firewall blocking?
ufw status
ufw allow 5000/tcp
```

**WebSocket not upgrading:**
```bash
# Verify proxy headers are set correctly
# Check NGINX config has: proxy_set_header Upgrade
# Restart: systemctl restart nginx
```

---

## Performance Tuning

### Increase worker connections (optional)
Edit `/etc/nginx/nginx.conf`:
```nginx
events {
    worker_connections 4096;
}
```

### Add caching for API responses (optional)
Add to moovr-api location block:
```nginx
# Cache GET requests for 5 minutes
proxy_cache_valid 200 5m;
proxy_cache_bypass $http_pragma $http_authorization;
```

### Limit connections per IP (optional)
```nginx
limit_conn_zone $binary_remote_addr zone=one:10m;
limit_conn one 100;
```
