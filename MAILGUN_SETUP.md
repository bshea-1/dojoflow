# Mailgun Email Integration Setup Guide

This guide will walk you through setting up Mailgun to send emails from your CRM using **codenfl@outlook.com**.

## Prerequisites

- A Mailgun account (free tier available)
- Access to your domain's DNS settings (optional, for production)
- Email address: codenfl@outlook.com

---

## Step 1: Create a Mailgun Account

1. **Sign Up**
   - Go to https://www.mailgun.com
   - Click "Start Sending" or "Sign Up"
   - Create your account with your email

2. **Verify Your Email**
   - Check your inbox for a verification email from Mailgun
   - Click the verification link

3. **Complete Onboarding**
   - You may be asked a few questions about your use case
   - Select "Transactional emails" or "CRM/Marketing"

---

## Step 2: Get Your API Key

1. **Navigate to API Keys**
   - Log in to your Mailgun dashboard
   - Click on your name in the top right
   - Select "API Keys" from the dropdown

2. **Copy Your Private API Key**
   - You'll see your **Private API key** listed
   - Click the eye icon to reveal it
   - Copy the entire key (starts with a long string of characters)
   - **Save this securely** - you'll need it for `.env.local`

---

## Step 3: Choose Your Domain

Mailgun offers two options:

### Option A: Use Mailgun's Sandbox Domain (Quick Start - Testing Only)

**Best for**: Testing immediately without DNS setup

1. **Find Your Sandbox Domain**
   - In the Mailgun dashboard, go to "Sending" → "Domains"
   - You'll see a sandbox domain like: `sandboxXXXXXXXX.mailgun.org`
   - Copy this domain

2. **Limitations**
   - ⚠️ Can only send to **authorized recipients** (you must add them manually)
   - Limited to 300 emails per day
   - Emails may have "via mailgun.org" in the sender

3. **Add Authorized Recipients** (Required for Sandbox)
   - Go to "Sending" → "Authorized Recipients"
   - Click "Add Recipient"
   - Enter the email addresses you want to test with
   - They'll receive a confirmation email to accept

### Option B: Use Your Own Domain (Production - Recommended)

**Best for**: Production use with your own domain

1. **Add Your Domain**
   - In the Mailgun dashboard, go to "Sending" → "Domains"
   - Click "Add New Domain"
   - Enter your domain (e.g., `yourdomain.com` or `mail.yourdomain.com`)
   - Click "Add Domain"

2. **Verify Your Domain (DNS Setup)**
   - Mailgun will show you DNS records to add
   - You need to add these records to your domain's DNS:
     - **TXT records** (for verification)
     - **MX records** (for receiving)
     - **CNAME records** (for tracking - optional)
   
3. **Add DNS Records**
   - Log in to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
   - Go to DNS settings
   - Add each record exactly as shown in Mailgun
   - Wait 24-48 hours for DNS propagation

4. **Verify Domain**
   - Back in Mailgun, click "Verify DNS Settings"
   - If all records are correct, you'll see green checkmarks
   - Your domain is now ready to send emails!

---

## Step 4: Configure Environment Variables

1. **Open Your `.env.local` File**
   - The file is already created in your CRM project
   - It should be at: `/Users/bshea/CRM/.env.local`

2. **Update the Mailgun Variables**

   Replace the placeholder values with your actual credentials:

   ```env
   # Mailgun Configuration
   MAILGUN_API_KEY=your-actual-api-key-here
   MAILGUN_DOMAIN=your-mailgun-domain-here
   MAILGUN_FROM_EMAIL=codenfl@outlook.com
   ```

   **Example with Sandbox Domain:**
   ```env
   MAILGUN_API_KEY=key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   MAILGUN_DOMAIN=sandbox-your-domain-id.mailgun.org
   MAILGUN_FROM_EMAIL=codenfl@outlook.com
   ```

   **Example with Custom Domain:**
   ```env
   MAILGUN_API_KEY=key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   MAILGUN_DOMAIN=mail.yourdomain.com
   MAILGUN_FROM_EMAIL=codenfl@outlook.com
   ```

3. **Save the File**
   - Make sure `.env.local` is in your `.gitignore` (it should be by default)
   - **Never commit this file to version control!**

---

## Step 5: Restart Your Development Server

1. **Stop the Current Server**
   - Press `Ctrl+C` in your terminal where the dev server is running

2. **Start the Server Again**
   ```bash
   npm run dev
   ```

3. **Verify No Errors**
   - Check the terminal for any error messages
   - The server should start successfully on http://localhost:3000

---

## Step 6: Test Email Sending

### If Using Sandbox Domain:

1. **Add Test Recipients First**
   - Go to Mailgun dashboard → "Authorized Recipients"
   - Add the email addresses you want to test with
   - Each recipient must confirm via email

2. **Send Test Email**
   - Navigate to the Families tab in your CRM
   - Select families with the authorized email addresses
   - Click "Email" button
   - Compose and send a test message

### If Using Custom Domain:

1. **Send Test Email**
   - Navigate to the Families tab in your CRM
   - Select one or more families
   - Click "Email" button
   - Compose and send a test message

2. **Verify Success**
   - Check for success toast notification
   - Check recipient inbox (and spam folder)
   - Email should appear from codenfl@outlook.com (or your domain)

---

## Step 7: Monitor Your Emails

1. **View Logs in Mailgun**
   - Go to Mailgun dashboard → "Sending" → "Logs"
   - You'll see all sent emails, delivery status, and any errors

2. **Check Delivery Stats**
   - Go to "Analytics" to see delivery rates
   - Monitor bounces and complaints

---

## Troubleshooting

### Error: "Missing Mailgun credentials"
- Make sure `MAILGUN_API_KEY` and `MAILGUN_DOMAIN` are set in `.env.local`
- Restart your development server after adding the variables

### Error: "Forbidden" or "401 Unauthorized"
- Verify your API key is correct
- Make sure you copied the **Private API key**, not the Public key
- Check for any extra spaces when pasting

### Emails Not Arriving (Sandbox Domain)
- Make sure recipients are added to "Authorized Recipients" in Mailgun
- Recipients must confirm their email address
- Check Mailgun logs for delivery status

### Emails Not Arriving (Custom Domain)
- Verify DNS records are properly configured
- Wait 24-48 hours for DNS propagation
- Check Mailgun domain verification status
- Check recipient's spam folder

### "Domain not verified" Error
- Go to Mailgun → Domains → Your Domain
- Click "Verify DNS Settings"
- Make sure all DNS records show green checkmarks
- If not, double-check your DNS configuration

---

## Upgrading from Sandbox to Production

When you're ready to move from sandbox to production:

1. **Add Your Domain** (see Step 3, Option B)
2. **Configure DNS Records**
3. **Wait for Verification**
4. **Update `.env.local`** with your new domain
5. **Restart Dev Server**
6. **Test Sending**

---

## Pricing & Limits

### Free Tier (Flex Plan)
- **First 3 months**: 5,000 emails/month FREE
- **After 3 months**: Pay-as-you-go at $0.80 per 1,000 emails
- No monthly commitment

### Foundation Plan
- **$35/month**: 50,000 emails included
- $0.80 per 1,000 additional emails
- Better for consistent volume

### Tips to Stay Within Free Tier
- Use sandbox domain for development/testing
- Only send to real users in production
- Monitor your usage in Mailgun dashboard

---

## Security Notes

- **API Key**: Treat this like a password. Never share it or commit it to Git.
- **Environment Variables**: The `.env.local` file should never be committed to version control.
- **Email Validation**: The CRM validates email addresses before sending.
- **Logs**: All email activity is logged in Mailgun for compliance.

---

## Next Steps

Once email sending is working:
- ✅ Test with multiple recipients
- ✅ Test rich text formatting (bold, italics, links)
- ✅ Monitor delivery rates in Mailgun dashboard
- ✅ Set up your custom domain for production
- ✅ Consider email templates for common messages

---

## Support

### Mailgun Documentation
- https://documentation.mailgun.com/

### Common Issues
- **DNS Setup**: https://help.mailgun.com/hc/en-us/articles/203637190
- **API Reference**: https://documentation.mailgun.com/en/latest/api-intro.html

### CRM Support
If you encounter issues with the CRM integration:
1. Check the browser console for error messages
2. Check the terminal/server logs
3. Verify all environment variables are set correctly
4. Check Mailgun logs for delivery status
