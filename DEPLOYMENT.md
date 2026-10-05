# EVENTKALAM — DEPLOYMENT & PRODUCTION GUIDE
Associated Company: **Robokalam Technologies** (Hanumkonda, Telangana)

---

## 1. Overview
EventKalam is built using **React 19, Vite, TypeScript, and Tailwind CSS**.
It is architected to seamlessly connect with **Supabase** for database, auth, and storage, while supporting static deployment on **Hostinger** or full-stack deployment on **Render**.

---

## 2. Environment Variables Configuration
Create a `.env` file based on `.env.example`:

```env
# Supabase Configuration
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"

# Company Information (Verified)
VITE_COMPANY_NAME="Robokalam Technologies"
VITE_COMPANY_LOCATION="Hanumkonda, Telangana - 506001"
VITE_COMPANY_EMAIL="robokalam@gmail.com"
```

---

## 3. Supabase Database Setup
1. Create a project on [Supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase project dashboard.
3. Open and run the migration script located at:
   `supabase/migrations/20261003_eventkalam_schema.sql`
4. This will create:
   - `profiles` table with role verification (`user`, `admin`).
   - `events` table with Event ID, dates, statuses, and contact emails.
   - `registrations` table with unique ticket codes.
   - `event_media` table for Showcase photographs and videos.
   - `contact_messages` table for inquiry routing.
   - Row-Level Security (RLS) policies enforcing admin-only mutations.
5. In **Storage**, create public bucket:
   - `event-media` (for event photos and showcase media)

### Assigning Administrator Role in Supabase
Public registration creates accounts with `role = 'user'`. To grant administrator privileges to your official account:
1. Register normally using your official email (e.g. `eventkalam.team@gmail.com`).
2. In Supabase **Table Editor** or **SQL Editor**, run:
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE email = 'eventkalam.team@gmail.com';
   ```
3. When that account signs in, EventKalam automatically recognizes the `admin` role and directs them to the **Admin Dashboard**.

---

## 4. Deploying on Hostinger (Recommended for Static SPA)
Hostinger supports high-speed static web hosting with custom domains.

### Steps:
1. Build the production bundle locally or via GitHub Actions:
   ```bash
   npm run build
   ```
2. The compiled assets will be in the `/dist` directory.
3. In Hostinger hPanel:
   - Navigate to **File Manager** -> `public_html`.
   - Upload all files from the `/dist` folder into `public_html`.
4. Ensure SPA routing by adding a `.htaccess` file inside `public_html`:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```
5. Connect your custom domain in Hostinger's Domain Manager with free SSL (Let's Encrypt).

---

## 5. Deploying on Render (Full-Stack / Node Server)
If you prefer running a Node.js server with Express:

1. Connect your GitHub repository to Render.
2. Choose **Web Service**.
3. Settings:
   - **Environment**: Node
   - **Build Command**: `npm run build`
   - **Start Command**: `node server.ts` or `tsx server.ts`
4. Add Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Render will build and deploy your application with automatic SSL and zero-downtime updates.

---

## 6. GitHub Repository Best Practices
- Never commit private service-role keys or production passwords.
- Always use the `.gitignore` provided.
- The repository structure is modular:
  - `/src/components/`: Reusable, accessible UI components
  - `/src/context/`: Auth & Event state providers
  - `/src/pages/`: Main application pages
  - `/src/lib/`: Supabase client & storage utilities
  - `/supabase/`: SQL migrations
