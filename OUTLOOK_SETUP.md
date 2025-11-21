# Outlook Email Integration Setup Guide

This guide will walk you through connecting your Outlook account (brennan.shea@codeninjas.com) to the CRM for sending mass emails.

## Prerequisites

- Access to the Azure Portal (https://portal.azure.com)
- Admin access to your Microsoft 365 organization (or ability to request admin consent)
- Your Outlook email address: brennan.shea@codeninjas.com

## Step 1: Register an Azure AD Application

1. **Navigate to Azure Portal**
   - Go to https://portal.azure.com
   - Sign in with your Microsoft account

2. **Access Azure Active Directory**
   - In the left sidebar, click "Azure Active Directory" (or search for it)
   - If you don't see it, click "More services" and search for "Azure Active Directory"

3. **Register a New Application**
   - In the Azure AD menu, click "App registrations"
   - Click "+ New registration" at the top
   - Fill in the registration form:
     - **Name**: `DojoFlow CRM Email Integration`
     - **Supported account types**: Select "Accounts in this organizational directory only"
     - **Redirect URI**: Leave blank for now (we're using client credentials flow)
   - Click "Register"

4. **Note Your Application Details**
   - After registration, you'll see the app overview page
   - **Copy and save these values** (you'll need them later):
     - **Application (client) ID**: e.g., `12345678-1234-1234-1234-123456789abc`
     - **Directory (tenant) ID**: e.g., `87654321-4321-4321-4321-cba987654321`

## Step 2: Create a Client Secret

1. **Navigate to Certificates & Secrets**
   - In your app's menu (left sidebar), click "Certificates & secrets"
   - Click the "Client secrets" tab
   - Click "+ New client secret"

2. **Create the Secret**
   - **Description**: `DojoFlow CRM Secret`
   - **Expires**: Choose "24 months" (or your preferred duration)
   - Click "Add"

3. **Copy the Secret Value**
   - **IMPORTANT**: Copy the **Value** immediately (not the Secret ID)
   - This value will only be shown once!
   - Save it securely - you'll need it for the `.env.local` file

## Step 3: Configure API Permissions

1. **Navigate to API Permissions**
   - In your app's menu, click "API permissions"
   - You'll see "Microsoft Graph" with "User.Read" permission by default

2. **Add Mail.Send Permission**
   - Click "+ Add a permission"
   - Click "Microsoft Graph"
   - Click "Application permissions" (NOT Delegated permissions)
   - Search for "Mail"
   - Expand "Mail" and check **"Mail.Send"**
   - Click "Add permissions"

3. **Grant Admin Consent**
   - Back on the API permissions page, you'll see "Mail.Send" listed
   - Click "✓ Grant admin consent for [Your Organization]"
   - Click "Yes" to confirm
   - The status should change to show a green checkmark

## Step 4: Configure Environment Variables

1. **Open Your `.env.local` File**
   - Navigate to your CRM project folder
   - Open the `.env.local` file (create it if it doesn't exist)

2. **Add the Following Variables**
   ```env
   # Microsoft Graph API Configuration
   AZURE_CLIENT_ID=your-application-client-id-here
   AZURE_CLIENT_SECRET=your-client-secret-value-here
   AZURE_TENANT_ID=your-directory-tenant-id-here
   OUTLOOK_EMAIL_FROM=brennan.shea@codeninjas.com
   ```

3. **Replace the Placeholder Values**
   - Replace `your-application-client-id-here` with your Application (client) ID from Step 1
   - Replace `your-client-secret-value-here` with your Client secret value from Step 2
   - Replace `your-directory-tenant-id-here` with your Directory (tenant) ID from Step 1
   - The `OUTLOOK_EMAIL_FROM` should already be set to your email

4. **Save the File**
   - Make sure `.env.local` is in your `.gitignore` (it should be by default)
   - **Never commit this file to version control!**

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

## Step 6: Test Email Sending

1. **Navigate to the Families Tab**
   - Log in to your CRM
   - Go to the Families section

2. **Select Recipients**
   - Check the boxes next to one or more families
   - Make sure they have valid email addresses

3. **Send a Test Email**
   - Click the "Email" button in the bulk actions
   - The compose dialog will open
   - Enter a subject: "Test Email from DojoFlow"
   - Enter a message body (try using bold, italics, etc.)
   - Click "Send Email"

4. **Verify Success**
   - You should see a success toast notification
   - Check the recipient's inbox (or your own if you sent it to yourself)
   - The email should appear from brennan.shea@codeninjas.com
   - Verify the formatting looks correct

## Troubleshooting

### Error: "Missing Azure AD credentials"
- Make sure all four environment variables are set in `.env.local`
- Restart your development server after adding the variables

### Error: "Failed to send email" or "Unauthorized"
- Verify your client secret is correct (it may have expired)
- Check that admin consent was granted for the Mail.Send permission
- Ensure the Application (client) ID and Tenant ID are correct

### Error: "User not found" or "Mailbox not found"
- Verify `OUTLOOK_EMAIL_FROM` matches your actual Outlook email address
- Make sure the email account exists and is active in your Microsoft 365 organization

### Emails Not Arriving
- Check the recipient's spam/junk folder
- Verify the recipient email addresses are correct
- Check the Azure Portal > Azure AD > App registrations > Your app > API permissions to ensure Mail.Send has admin consent

### Permission Issues
- If you can't grant admin consent yourself, contact your Microsoft 365 administrator
- They'll need to grant consent for the Mail.Send permission in the Azure Portal

## Security Notes

- **Client Secret**: Treat this like a password. Never share it or commit it to version control.
- **Environment Variables**: The `.env.local` file should never be committed to Git.
- **Permissions**: The Mail.Send permission allows the app to send emails as any user in your organization. This is necessary for the integration but should be monitored.
- **Audit Logs**: Email sending activities are logged in Microsoft 365 audit logs for compliance.

## Next Steps

Once email sending is working:
- Test with multiple recipients
- Test with different email content (rich text, links, etc.)
- Consider setting up email templates for common messages
- Monitor your sent items folder in Outlook to verify emails are being saved

## Support

If you encounter issues not covered in this guide:
1. Check the browser console for error messages
2. Check the terminal/server logs for detailed error information
3. Verify all Azure AD configuration steps were completed correctly
4. Ensure your Microsoft 365 account has the necessary permissions
