# How to Deploy DojoFlow to the Web

DojoFlow is a Next.js application. To "convert" this source code into a live website, you need to **build** and **deploy** it.

## Option 1: Vercel (Recommended)

The easiest way to deploy is using [Vercel](https://vercel.com), the creators of Next.js.

1.  **Push to GitHub:**
    *   Initialize a git repo: `git init`
    *   Commit your code: `git add . && git commit -m "Initial commit"`
    *   Push to a new GitHub repository.

2.  **Import to Vercel:**
    *   Go to Vercel.com and click "Add New Project".
    *   Select your GitHub repository.

3.  **Configure Environment:**
    *   In the Vercel project settings, add your Supabase keys:
        *   `NEXT_PUBLIC_SUPABASE_URL`
        *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4.  **Deploy:**
    *   Click "Deploy". Vercel will build the HTML/JS/CSS and host it globally.

## Option 2: Build Locally (For Testing)

If you want to see the "converted" HTML/JS files on your machine:

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Build:**
    ```bash
    npm run build
    ```
    *   This creates a `.next` folder containing the optimized application.

3.  **Start Production Server:**
    ```bash
    npm start
    ```
    *   Open `http://localhost:3000` to see the production version.

## Why not just "index.html"?

DojoFlow uses **Server-Side Rendering (SSR)** for security and performance.
*   **Security:** It protects routes (like `/dashboard`) on the server before the page even loads.
*   **Performance:** It renders the initial HTML on the server so it's fast for users.

Because of this, you cannot just open an `index.html` file in your browser. You need a Node.js server (like Vercel or `npm start`) to serve the application.

