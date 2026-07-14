# Project Plan, Strategy & System Architecture

## 1. Requirement Analysis
Based on the provided requirements and the additional need for a single/multi-product toggle, the core requirements are:
- **High-Converting Frontend**: Built with React, Vite, and Tailwind CSS.
- **Performance**: <2s load time, mobile-first, WebP, lazy loading.
- **Order Management**: Direct COD form with validation, OTP (optional), duplicate prevention, and invoice generation.
- **Marketing Tracking**: FB CAPI, Pixel, GA4, GTM, and standard e-commerce events.
- **Admin Control**: Dashboard to view/export orders, and **a crucial toggle to switch between a Single-Product and Multi-Product store layout**.
- **Future-proofing**: Courier API integration readiness.

## 2. Low-Cost, Self-Hostable Strategy (No Vendor Lock-in)
To address concerns about data ownership, vendor lock-in (like Supabase), and the ability to migrate to any custom hosting (like Hostinger, cPanel, or a cheap VPS) in the future, we will use a completely open-source, portable stack.

- **Frontend (Client)**: **React + Vite**. When built, this produces static HTML/JS/CSS files. These can be hosted anywhere (Vercel for free now, or directly on any standard web hosting/cPanel later).
- **Backend (API)**: **Node.js (Express)**. A lightweight, fast backend that handles form submissions, admin authentication, and data retrieval. Almost all modern shared hosting (like Namecheap, Hostinger) supports Node.js.
- **Database**: **MySQL** or **SQLite**. 
  - *Why MySQL?* It is the standard database available on 100% of all web hosting platforms (cPanel, etc.). Complete ownership of your data, easy to backup (SQL dump), and handles thousands of orders effortlessly.
- **Security & Data Ownership**: By using your own Node.js backend and MySQL database, all customer data, orders, and products are stored on *your* infrastructure. You can create the database under the client's own hosting account when they are ready to purchase one.

## 3. System Architecture Design

### A. Frontend Layer (React + Vite + Tailwind)
- **Storefront App**: 
  - Dynamic routing based on `store_mode` fetched from the Node.js API.
  - Single-product landing page or multi-product catalog layout based on the setting.
- **Admin App**: 
  - JWT (JSON Web Token) based authentication for the store owner.
  - Features: Orders Data Table, CSV Export, Product Management, Store Settings.

### B. Backend Layer (Node.js + Express)
- **RESTful API**: Endpoints for `/api/products`, `/api/orders`, `/api/settings`, and `/api/admin/*`.
- **Database ORM/Query Builder**: Using a lightweight tool (like Sequelize, Prisma, or simple SQL queries) to interact with the MySQL database securely (preventing SQL injection).

### C. Data Model (MySQL)
1. **Settings Table**: Stores global config `store_mode` ('single' or 'multi'), store name.
2. **Products Table**: Stores product details (name, price, image URLs, USP).
3. **Orders Table**: Customer info (Name, Phone, Address), total amount, status, timestamps.
4. **Order_Items Table**: Maps products to orders for the multi-product system.
5. **Users Table**: For admin authentication (securely hashed passwords).

### D. Hosting Flexibility (The "Buy Hosting Later" Scenario)
- **Phase 1 (Zero Cost / Testing)**: Host frontend on Vercel (free). Host backend on Render/Railway (free tier). Use a free MySQL add-on or SQLite.
- **Phase 2 (Client Buys Hosting)**: Simply copy the frontend `dist` folder and the Node.js backend files to their new cPanel/VPS. Import the MySQL database backup. No code rewrite needed.

## 4. Execution Plan
1. **Phase 1: Setup & Architecture**: Initialize React/Vite frontend and Node.js/Express backend. Define MySQL schema.
2. **Phase 2: Admin & Core Logic**: Build the Admin panel, JWT authentication, Single/Multi toggle, and product management.
3. **Phase 3: Storefront UI**: Build the mobile-first landing page (Single Product mode first).
4. **Phase 4: Order System**: Implement checkout API, validation, duplicate prevention, and invoice generation.
5. **Phase 5: Tracking & Polish**: Add GTM, Pixel, CAPI, WebP optimizations.
