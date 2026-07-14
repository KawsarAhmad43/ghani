# Ghani Mustard Oil - Project Architecture & Tech Stack

## 1. Technical Stack

This project is built as a monorepo workspace containing both the frontend client and the backend API server.

**Frontend:**
* **Framework:** React 18
* **Build Tool:** Vite
* **Routing:** React Router DOM
* **HTTP Client:** Axios
* **Icons:** Lucide Icons
* **Styling:** Vanilla HSL CSS variables (Custom dynamic styling)

**Backend:**
* **Runtime:** Node.js
* **Framework:** Express.js
* **Authentication:** JSON Web Tokens (JWT) & bcryptjs (password hashing)
* **File Uploads:** multer (Multipart Form upload)
* **Image Processing:** sharp (Image Compressor, auto-conversion to WebP)
* **Emails/SMS:** nodemailer (Mailer)

**Database:**
* **Type:** MySQL
* **Integrity:** Utilizing SQL Transaction blocks (`beginTransaction`, `commit`, `rollback`) to protect multi-table insertions.

**Workspace & Tooling:**
* **Monorepo:** npm workspaces
* **Task Runner:** concurrently (for running both frontend and backend dev servers simultaneously)

---

## 2. How the Full System Works

The system is designed as a high-converting, single-product e-commerce platform tailored for marketing campaigns (Meta Ads). It is divided into two primary workflows: **Customer Order Flow** and **Admin Operations Flow**.

### System Architecture
The application runs as two separate services in a monorepo structure:
- **`frontend/`**: The React client that serves the storefront, product variants, checkout process, and the admin dashboard interface.
- **`backend/`**: The Node.js API that processes orders, handles rate limiting, interfaces with MySQL, processes static WebP media assets, and provides authentication.

### Customer Order Flow
1. **Checkout Initiation**: A customer selects variants and submits the checkout form.
2. **OTP Verification (Conditional)**: The frontend checks with the backend if OTP (via SMS/Email) is enabled.
   - If enabled, the backend applies rate limiting (e.g., 1 request/60s per target). If it passes, an OTP is dispatched via SMTP/SMS and temporarily saved in the DB. The customer must submit this code for verification.
   - If disabled, the checkout proceeds directly.
3. **Duplicate Prevention**: The backend checks if an identical order (same phone + amount) was placed within the last 30 seconds to prevent double-clicks or duplicates. If found, it bypasses insertion and returns the existing order ID.
4. **Order Insertion**: The backend initiates a MySQL Transaction:
   - Creates a new User Profile & Address (if a new customer).
   - Inserts the new Order into the `orders` table.
   - Inserts the variants into the `order_items` table.
5. **Completion**: If all queries succeed, the transaction is committed, and the customer is redirected to a Thank You page with an auto-generated printable invoice. If any query fails, the transaction rolls back to prevent data corruption.

### Administrative Control (Admin Flow)
1. **Authentication**: Admin navigates to `/admin`. If no valid `admin_token` exists, they are redirected to login.
2. **Login Process**: Admin provides credentials. The backend verifies the password using `bcryptjs` and returns a signed JWT token if valid.
3. **Authorized Actions**: The admin token is stored in the browser's `localStorage` and sent in the `Authorization` header for all protected API requests.
4. **Operations**: The admin can manage products (CRUD), update order statuses, moderate reviews, view analytics, and configure global store settings (e.g., Tracking codes, CAPI settings, OTP toggles). Backend middleware (`requireAdmin`) validates the JWT before executing any database queries.
