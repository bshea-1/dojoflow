# Resend Email Integration Setup Guide

This guide will walk you through setting up Resend to send emails from your CRM.

## Prerequisites

- A Resend account (https://resend.com)
- Access to your domain's DNS settings (optional, for production)

---

## Step 1: Get Your API Key

1. **Sign Up / Log In**
   - Go to https://resend.com
   - Create an account or log in

2. **Create API Key**
   - Go to **API Keys** in the sidebar
   - Click **Create API Key**
   - Name: `DojoFlow CRM`
   - Permission: **Full Access** (or Sending Access)
   - Click **Add**
   - **Copy the key immediately** (starts with `re_`)

---

## Step 2: Configure Environment Variables

1. **Open Your `.env.local` File**
   - Located at `/Users/bshea/CRM/.env.local`

2. **Update Resend Variables**
   Replace the placeholders with your actual credentials:

   ```env
   # Resend Configuration
   RESEND_API_KEY=re_123456789
   RESEND_FROM_EMAIL=onboarding@resend.dev
   ```

   *Note: We use `onboarding@resend.dev` as the sender to ensure delivery without domain verification. The `Reply-To` address is automatically set to `codenfl@outlook.com` in the code.*

3. **Save the File**

---

## Step 3: Verify Your Domain (Recommended for Production)

To send from your own email (e.g., `info@codeninjas.com`) instead of `onboarding@resend.dev`:

1. **Add Domain**
   - Go to **Domains** in Resend dashboard
   - Click **Add Domain**
   - Enter your domain (e.g., `codeninjas.com`)
   - Select a region (us-east-1 is fine)

2. **Update DNS Records**
   - Resend will provide DNS records (MX, TXT, CNAME)
   - Add these to your domain provider (GoDaddy, Namecheap, etc.)
   - Click **Verify DNS Records**

3. **Update `.env.local`**
   - Once verified, change `RESEND_FROM_EMAIL` to your custom email:
     ```env
     RESEND_FROM_EMAIL=info@codeninjas.com
     ```

---

## Step 4: Restart Server & Test

1. **Restart Dev Server**
   ```bash
   npm run dev
   ```

2. **Test Sending**
   - Go to the **Families** tab
   - Select a family
   - Click **Email**
   - Send a test message

---

## Troubleshooting

### Error: "From address is not allowed"
- If using the free tier without a verified domain, you can ONLY send from `onboarding@resend.dev`.
- You can ONLY send TO the email address you signed up with (unless you verify a domain).

### Error: "Missing Resend API key"
- Check `.env.local` and ensure `RESEND_API_KEY` is set.

### Emails not arriving
- Check Spam/Junk folder.
- Check Resend Dashboard > **Emails** to see the log of sent messages.

---

## Security Notes
- Never commit `.env.local` to Git.
- Resend API keys are sensitive secrets.
