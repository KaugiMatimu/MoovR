# Environment Variables Templates

## BACKEND .env Template
**File:** `moovr-backend/.env`

```env
# ==========================================
# SERVER CONFIGURATION
# ==========================================
PORT=5000
NODE_ENV=production
VITE_API_URL=https://api.moovr.taxi

# ==========================================
# DATABASE (MongoDB)
# ==========================================
# Option 1: MongoDB Atlas (Cloud - Recommended)
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/moovr_db?retryWrites=true&w=majority

# Option 2: Local MongoDB
# MONGODB_URI=mongodb://localhost:27017/moovr_db

# ==========================================
# AUTHENTICATION
# ==========================================
JWT_SECRET=your_super_secret_key_change_this_to_something_random_12345abcdef!@#$%
JWT_EXPIRE=30d
REFRESH_TOKEN_SECRET=another_secret_key_change_this_12345abcdef!@#$%

# ==========================================
# FIREBASE CONFIGURATION
# ==========================================
VITE_FIREBASE_PROJECT_ID=moovr-73876
FIREBASE_STORAGE_BUCKET=moovr-73876.firebasestorage.app
GOOGLE_APPLICATION_CREDENTIALS=./moovr-73876-firebase-adminsdk-fbsvc-911ab2686e.json

# ==========================================
# CORS CONFIGURATION
# ==========================================
CORS_ORIGIN=https://moovr.taxi,https://www.moovr.taxi,https://admin.moovr.taxi,http://localhost:3000,http://localhost:5173

# ==========================================
# EMAIL / SMTP (For notifications & password reset)
# ==========================================
# Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM=noreply@yourdomain.com

# Or use SendGrid
# SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
# SENDGRID_FROM=noreply@yourdomain.com

# ==========================================
# SMS / TWILIO (For SMS notifications)
# ==========================================
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# ==========================================
# EMERGENCY CONFIGURATION
# ==========================================
DEFAULT_EMERGENCY_NUMBER=911
ADMIN_ALERT_EMAIL=admin@yourdomain.com
ADMIN_ALERT_PHONE=+1234567890

# ==========================================
# PAYMENT (Stripe - Optional)
# ==========================================
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# ==========================================
# GOOGLE MAPS (For location features)
# ==========================================
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# ==========================================
# AWS (If using S3 for storage - Optional)
# ==========================================
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# ==========================================
# CLOUDINARY (For image uploads - Optional)
# ==========================================
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ==========================================
# RECAPTCHA (Google reCAPTCHA)
# ==========================================
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key

# ==========================================
# LOGGING & DEBUGGING
# ==========================================
LOG_LEVEL=info
NODE_DEBUG=false

# ==========================================
# SOCKET.IO CONFIGURATION
# ==========================================
SOCKET_IO_CORS_ORIGINS=https://moovr.taxi,https://admin.moovr.taxi,http://localhost:3000,http://localhost:5173
```

---

## FRONTEND .env.production Template
**File:** `moovr-web/.env.production`

```env
# ==========================================
# API CONFIGURATION
# ==========================================
VITE_API_URL=https://api.moovr.taxi

# ==========================================
# FIREBASE CONFIGURATION
# ==========================================
VITE_FIREBASE_PROJECT_ID=moovr-73876
VITE_FIREBASE_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=moovr-73876.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://moovr-73876.firebaseio.com
VITE_FIREBASE_STORAGE_BUCKET=moovr-73876.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdefg1234567890abcd

# ==========================================
# GOOGLE MAPS
# ==========================================
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# ==========================================
# STRIPE (Public Key)
# ==========================================
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx

# ==========================================
# APP CONFIGURATION
# ==========================================
VITE_APP_NAME=Moovr
VITE_APP_ENVIRONMENT=production

# ==========================================
# FEATURE FLAGS
# ==========================================
VITE_ENABLE_GOOGLE_LOGIN=true
VITE_ENABLE_FACEBOOK_LOGIN=true
VITE_ENABLE_STRIPE_PAYMENT=true
VITE_ENABLE_EMERGENCY_ALERTS=true
```

---

## ADMIN PANEL .env.local Template
**File:** `admin-panel/.env.local`

```env
# ==========================================
# API CONFIGURATION
# ==========================================
NEXT_PUBLIC_API_URL=https://api.moovr.taxi
API_URL=https://api.moovr.taxi

# ==========================================
# FIREBASE CONFIGURATION
# ==========================================
NEXT_PUBLIC_FIREBASE_PROJECT_ID=moovr-73876
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=moovr-73876.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=moovr-73876.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdefg1234567890abcd

# ==========================================
# GOOGLE MAPS
# ==========================================
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# ==========================================
# NEXTJS CONFIGURATION
# ==========================================
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://admin.moovr.taxi
```

---

## How to Get These Values

### JWT_SECRET
```bash
# Generate secure random key
openssl rand -base64 32
```

### Firebase Credentials
1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project → Settings → Project Settings
3. Copy: `Project ID`, `Storage Bucket`, etc.

### Google Maps API Key
1. Go to https://console.cloud.google.com
2. Enable Maps API
3. Create API key in Credentials section

### Stripe Keys
1. Go to https://dashboard.stripe.com
2. Navigate to API Keys
3. Copy Secret Key (live mode)

### Twilio Credentials
1. Go to https://www.twilio.com/console
2. Copy: Account SID, Auth Token, Phone Number

### MongoDB Atlas Connection
1. Go to https://www.mongodb.com/cloud/atlas
2. Create cluster → Connect → Get connection string
3. Format: `mongodb+srv://username:password@cluster.mongodb.net/database`

### Gmail SMTP
1. Enable 2-Factor Authentication
2. Generate App Password at: https://myaccount.google.com/apppasswords
3. Use: Email and generated password

---

## How to Create .env File on Server

```bash
# SSH into server
ssh root@your_server_ip

# Navigate to backend
cd /home/username/odare/moovr-backend

# Create .env file using nano
nano .env

# Paste the template content above
# Replace placeholders with actual values
# Save: Ctrl+X → Y → Enter

# Verify it was created
cat .env

# Make sure it's not readable by others
chmod 600 .env
```

---

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` files to Git
- Never share these files publicly
- Regenerate all secrets when deploying to production
- Use strong, random values for JWT_SECRET
- Keep API keys in `.env` only, never in frontend code
- Rotate keys periodically
- Never use development keys in production
