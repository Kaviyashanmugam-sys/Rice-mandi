# 🌾 Rice Mandi — WhatsApp Grocery Ordering Bot

Complete WhatsApp bot for a Rice Mandi shop with admin dashboard.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SYSTEM ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   Customer WhatsApp  ◄──────►  Meta Cloud API                       │
│                                      │                               │
│                              HTTPS Webhook POST                      │
│                                      │                               │
│                         ┌────────────▼────────────┐                 │
│                         │   Node.js/Express Server  │                │
│                         │   (server.js)             │                │
│                         │                           │                │
│                         │  ┌─────────────────────┐  │               │
│                         │  │  Webhook Handler     │  │               │
│                         │  │  (webhookRoutes.js)  │  │               │
│                         │  └──────────┬──────────┘  │               │
│                         │             │              │               │
│                         │  ┌──────────▼──────────┐  │               │
│                         │  │   Bot State Machine  │  │               │
│                         │  │   (botService.js)    │  │               │
│                         │  └──────────┬──────────┘  │               │
│                         │             │              │               │
│                         │  ┌──────────▼──────────┐  │               │
│                         │  │  WhatsApp API Svc    │  │               │
│                         │  │ (whatsappService.js) │  │               │
│                         │  └──────────────────────┘  │               │
│                         │                           │                │
│                         │  REST APIs (JWT Auth)     │                │
│                         │  ┌─────────────────────┐  │               │
│                         │  │ /api/categories      │  │               │
│                         │  │ /api/products        │  │               │
│                         │  │ /api/orders          │  │               │
│                         │  │ /api/customers       │  │               │
│                         │  │ /api/dashboard       │  │               │
│                         │  └─────────┬───────────┘  │               │
│                         └────────────┼───────────────┘               │
│                                      │                               │
│                              ┌───────▼───────┐                      │
│                              │   MongoDB      │                      │
│                              │  Collections:  │                      │
│                              │  • customers   │                      │
│                              │  • categories  │                      │
│                              │  • products    │                      │
│                              │  • orders      │                      │
│                              │  • users       │                      │
│                              │  • settings    │                      │
│                              └───────────────┘                      │
│                                                                       │
│   Admin Browser  ◄──────►  React App (Port 3000)                    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📱 WhatsApp Bot Flow

```
Customer sends "Hi"
        │
        ▼
  WELCOME MESSAGE
  [Browse & Order] [View Cart] [My Orders]
        │
        ▼ (Browse & Order)
  CATEGORY SELECTION (List Message)
  🌾 Rice | 🫘 Dal | 🌑 Uzhundhu | 🧴 Oil | ...
        │
        ▼ (Select Category)
  PRODUCT LIST (List Message)
  Ponni Rice ₹55/kg ✅ | Sona Masoori ₹65/kg ✅ | ...
        │
        ▼ (Select Product)
  QUANTITY SELECTION (List Message)
  1 kg ₹55 | 2 kg ₹110 | 5 kg ₹275 | ...
  Or type custom quantity
        │
        ▼ (Select Quantity)
  ITEM ADDED TO CART ✅
  [Add More] [View Cart] [Checkout]
        │                    │
        ▼                    ▼
  (Continue)           VIEW CART
                      Ponni Rice 2kg = ₹110
                      Total: ₹110 + ₹50 delivery
                      [Checkout] [Add More] [Clear]
                            │
                            ▼
                    CHECKOUT FLOW
                    Step 1: Enter Name
                    Step 2: Enter Phone
                    Step 3: Enter Address
                    Step 4: Select Payment
                    [COD] [UPI] [Bank Transfer]
                            │
                            ▼
                    ORDER CONFIRMED! 🎉
                    #RM12345678
                    Items, Total, Address shown
```

---

## 📁 Project Structure

```
rice-mandi-bot/
├── backend/
│   ├── server.js                  # Express app entry
│   ├── .env.example               # Environment variables template
│   ├── config/
│   │   ├── database.js            # MongoDB connection
│   │   ├── logger.js              # Winston logger
│   │   └── whatsapp.js            # WhatsApp API config
│   ├── models/
│   │   ├── User.js                # Admin users
│   │   ├── Customer.js            # WhatsApp customers + session state
│   │   ├── Category.js            # Product categories
│   │   ├── Product.js             # Products with stock
│   │   ├── Order.js               # Orders + items + status history
│   │   └── Settings.js            # Configurable shop settings
│   ├── routes/
│   │   ├── webhookRoutes.js       # WhatsApp webhook (GET verify + POST receive)
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── settingsRoutes.js
│   ├── controllers/               # Request handlers
│   ├── services/
│   │   ├── botService.js          # Core bot state machine + all handlers
│   │   ├── whatsappService.js     # WhatsApp API wrappers
│   │   └── messageTemplates.js    # All bot message templates
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT protect + role guards
│   │   └── errorMiddleware.js     # Global error handler
│   ├── utils/
│   │   └── seeder.js              # DB seed script
│   └── uploads/                   # Product images
│
└── frontend/
    ├── public/index.html
    └── src/
        ├── App.jsx                # Complete admin dashboard (all pages)
        ├── index.js
        ├── index.css
        └── services/
            └── api.js             # Axios API client
```

---

## 🗃️ MongoDB Schema Summary

### Customer
- `whatsappPhone` (unique) — session identity
- `sessionState` — bot state machine position
- `sessionData` — checkout temp data (name/phone/address in progress)
- `cart[]` — live cart items
- `totalOrders`, `totalSpent` — lifetime stats

### Order
- `orderId` — human-readable (RM + timestamp)
- `customer` ref → Customer
- `items[]` — snapshot of products at order time
- `orderStatus` — Pending → Accepted → Packed → Out for Delivery → Delivered
- `statusHistory[]` — full audit trail
- `notificationsSent{}` — tracks which WhatsApp notifications were sent

### Product
- `quantityOptions[]` — drives quantity list in bot (e.g. [1,2,5,10,25])
- `stockQuantity` — decremented on order (can be added)
- `unit` — kg/litre/piece/etc

---

## 🚀 Setup & Deployment

### Prerequisites
- Node.js 18+
- MongoDB 6+ (local or Atlas)
- Meta Developer Account with WhatsApp Business API access
- A public HTTPS URL (use ngrok for dev, VPS/Render for prod)

### Step 1: Clone & Install
```bash
cd backend && npm install
cd ../frontend && npm install
```

### Step 2: Configure Environment
```bash
cp backend/.env.example backend/.env
# Fill in all values in .env
```

Required `.env` values:
| Key | Description |
|-----|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Any long random string |
| `WHATSAPP_ACCESS_TOKEN` | From Meta Developer Console → App → WhatsApp |
| `WHATSAPP_PHONE_NUMBER_ID` | Phone number ID from Meta console |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | Your custom string (used during webhook setup) |

### Step 3: Seed Database
```bash
cd backend && npm run seed
```
This creates: admin user, 6 categories, 16 products, default settings.

### Step 4: Setup WhatsApp Webhook (Meta Console)
1. Go to https://developers.facebook.com → Your App → WhatsApp → Configuration
2. Webhook URL: `https://your-domain.com/webhook`
3. Verify Token: same as `WHATSAPP_WEBHOOK_VERIFY_TOKEN` in .env
4. Subscribe to: `messages`, `message_deliveries`, `message_reads`

### Step 5: Start Development
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm start
```

### Step 6: Production Deployment (Ubuntu VPS)
```bash
# Install PM2
npm install -g pm2

# Build frontend
cd frontend && npm run build

# Start backend with PM2
cd backend
pm2 start server.js --name rice-mandi-bot
pm2 startup
pm2 save

# Serve frontend with nginx or serve static from Express
```

#### Sample nginx config:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP → HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Admin Dashboard (React build)
    location / {
        root /var/www/rice-mandi/frontend/build;
        try_files $uri /index.html;
    }

    # API + Webhook
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /webhook {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Uploads
    location /uploads {
        proxy_pass http://localhost:5000;
    }
}
```

---

## 🔑 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | None | Login → returns JWT |
| GET | `/api/auth/me` | JWT | Get current user |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List orders (filterable by status, search) |
| GET | `/api/orders/:id` | Get order detail |
| PATCH | `/api/orders/:id/status` | Update order status → triggers WhatsApp notification |
| GET | `/api/orders/stats/summary` | Today/month stats |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products |
| POST | `/api/products` | Create product (multipart/form-data) |
| PATCH | `/api/products/:id/stock` | Update stock |
| PATCH | `/api/products/:id/toggle` | Toggle availability |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Main KPIs |
| GET | `/api/dashboard/revenue-chart?period=week\|month\|year` | Chart data |
| GET | `/api/dashboard/top-products` | Best sellers |
| GET | `/api/dashboard/category-sales` | Revenue by category |

---

## 🔒 Security Features

- Helmet.js for security headers
- Rate limiting (100 req/15min for API, 200/min for webhook)
- JWT authentication with expiry
- Password hashing with bcrypt (12 rounds)
- MongoDB injection protection via Mongoose
- Input validation on all routes
- CORS restricted to frontend origin

---

## 📱 WhatsApp Message Types Used

| Type | Used For |
|------|----------|
| **Text** | Welcome, checkout steps, order confirmation, status updates |
| **Interactive Button** | Welcome (3 options), item added, cart view, payment selection |
| **Interactive List** | Categories, products, quantity selection |
| **Template** | (Future: promotional broadcasts — requires Meta approval) |

---

## 🧪 Testing the Bot

1. Start the backend: `npm run dev`
2. Expose locally: `ngrok http 5000`
3. Set webhook URL in Meta console to `https://xxxx.ngrok.io/webhook`
4. Send "Hi" to your WhatsApp Business number
5. The bot will respond with the welcome menu

---

## 📊 Admin Dashboard Pages

| Page | Features |
|------|----------|
| **Dashboard** | Revenue KPIs (today/month), recent orders table |
| **Orders** | Filter by status, search, update order status, view details |
| **Products** | CRUD, toggle availability, stock levels |
| **Categories** | CRUD, enable/disable, product count |
| **Customers** | List, search, block/unblock, order history |
| **Reports** | Top products, category revenue breakdown |

---

## 🆘 Common Issues

**Webhook not receiving messages:**
- Ensure URL is HTTPS (ngrok for dev)
- Verify token matches exactly
- Subscribe to "messages" in Meta console

**Bot not responding:**
- Check `WHATSAPP_ACCESS_TOKEN` is valid (they expire — use permanent token)
- Check logs: `pm2 logs rice-mandi-bot`

**Images not showing in admin:**
- Ensure `uploads/` folder exists and is writable
- Check nginx `/uploads` proxy config

---

## Recent Updates

### ✅ Single-Page Checkout
Checkout now uses WhatsApp Flow (single form card) instead of step-by-step messages.
- Name, Phone, Address, Payment — all in one screen
- Validates all fields before submitting
- Falls back to text-based flow if `WHATSAPP_CHECKOUT_FLOW_ID` is not set

### ✅ Language Selector (EN / தமிழ்)
Bot preview supports English and Tamil.
- Click 🌐 in the bot header to switch languages
- All messages, buttons, labels, errors switch instantly
- Real backend: store customer language preference in `Customer.language` field (already in model)

### ✅ Product Search
Customers can search by product name (English or Tamil) or category.
- Type the product name directly when in SEARCHING state
- Results shown as list message, tap to select and add to cart
