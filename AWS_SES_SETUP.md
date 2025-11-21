# Amazon SES Email Integration Setup Guide

This guide will walk you through setting up Amazon Simple Email Service (SES) to send emails from your CRM using **codenfl@outlook.com**.

## Prerequisites

- An AWS Account (https://aws.amazon.com)
- Access to the AWS Console
- Email address: codenfl@outlook.com

---

## Step 1: Verify Your Email Identity

1. **Navigate to Amazon SES**
   - Log in to the AWS Console
   - Search for "Amazon SES" (Simple Email Service)
   - Select your region (e.g., **US East (N. Virginia) / us-east-1**) - *Note: Stick to one region!*

2. **Create Identity**
   - In the left sidebar, click **Identities**
   - Click **Create identity**
   - Select **Email address**
   - Enter `codenfl@outlook.com`
   - Click **Create identity**

3. **Verify Email**
   - Check your Outlook inbox for a verification email from Amazon Web Services
   - Click the verification link
   - The identity status in SES should change to **Verified**

---

## Step 2: Get AWS Credentials

You need an IAM user with permission to send emails via SES.

1. **Navigate to IAM**
   - Search for "IAM" in the AWS Console

2. **Create User**
   - Click **Users** → **Create user**
   - User name: `crm-email-sender`
   - Click **Next**

3. **Set Permissions**
   - Select **Attach policies directly**
   - Search for `AmazonSESFullAccess` (or create a custom policy with `ses:SendEmail` and `ses:SendRawEmail`)
   - Select the policy
   - Click **Next** → **Create user**

4. **Create Access Keys**
   - Click on the newly created user (`crm-email-sender`)
   - Click the **Security credentials** tab
   - Scroll down to **Access keys**
   - Click **Create access key**
   - Select **Application running outside AWS** (or "Other")
   - Click **Next** → **Create access key**

5. **Copy Credentials**
   - You will see an **Access key** and a **Secret access key**
   - **IMPORTANT**: Copy these immediately! You won't be able to see the secret key again.
   - Save them securely for the next step.

---

## Step 3: Configure Environment Variables

1. **Open Your `.env.local` File**
   - Located at `/Users/bshea/CRM/.env.local`

2. **Update AWS Variables**
   Replace the placeholders with your actual credentials:

   ```env
   # AWS SES Configuration
   AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
   AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   AWS_REGION=us-east-1
   AWS_FROM_EMAIL=codenfl@outlook.com
   ```

   *Make sure `AWS_REGION` matches the region where you verified your email (Step 1).*

3. **Save the File**

---

## Step 4: Move Out of Sandbox (Production)

**IMPORTANT**: New AWS accounts start in the **SES Sandbox**.
- You can only send to **verified email addresses**.
- You have a sending limit (e.g., 200 emails/day).

**To send to ANY recipient:**
1. Go to **SES** → **Account dashboard**
2. You will see a banner saying you are in the Sandbox.
3. Click **Request production access**.
4. Fill out the form:
   - **Mail type**: Transactional or Marketing
   - **Website URL**: Your CRM URL
   - **Use case description**: Explain that you are sending notifications to families from your CRM.
5. Submit the request. AWS usually approves within 24 hours.

**Until you are approved, you must verify every recipient email address in the SES console (Identities → Create identity → Email address) to test sending to them.**

---

## Step 5: Restart Server & Test

1. **Restart Dev Server**
   ```bash
   npm run dev
   ```

2. **Test Sending**
   - Go to the **Families** tab
   - Select a family (make sure their email is verified if you are still in Sandbox!)
   - Click **Email**
   - Send a test message

---

## Troubleshooting

### Error: "Email address is not verified"
- You are likely still in the SES Sandbox.
- You must verify the **To** address in the SES Console until you get production access.

### Error: "SimpleEmailServiceToken ... is not authorized"
- Check your IAM user permissions. Ensure `AmazonSESFullAccess` is attached.

### Error: "InvalidClientTokenId"
- Check your `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.
- Ensure there are no extra spaces.

### Emails not arriving
- Check Spam/Junk folder.
- Verify your `AWS_FROM_EMAIL` is correct and verified in SES.

---

## Security Notes
- Never commit `.env.local` to Git.
- Rotate your IAM access keys periodically.
