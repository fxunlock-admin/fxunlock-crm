# Email Setup Guide for FX Unlocked CRM

This guide explains how to set up email notifications for new user creation.

## Overview

When an admin creates a new user/staff member in the CRM, the system automatically sends a welcome email containing:
- Login credentials
- Temporary password
- Instructions on how to change the password
- Password requirements
- Link to the CRM login page

## Prerequisites

You need to install the `nodemailer` package:

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
FRONTEND_URL=http://localhost:3000
```

## Setup Instructions

### Option 1: Using Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account:
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate an App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or your device)
   - Google will generate a 16-character password
   - Copy this password and use it as `EMAIL_PASSWORD` in your `.env`

3. **Update your `.env` file**:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   EMAIL_FROM=your-email@gmail.com
   FRONTEND_URL=http://localhost:3000
   ```

### Option 2: Using SendGrid (Recommended for Production)

1. **Create a SendGrid Account**:
   - Go to https://sendgrid.com
   - Sign up for a free account

2. **Generate an API Key**:
   - Go to Settings > API Keys
   - Create a new API key
   - Copy the key

3. **Update your `.env` file**:
   ```env
   EMAIL_SERVICE=SendGrid
   EMAIL_USER=apikey
   EMAIL_PASSWORD=SG.your-api-key-here
   EMAIL_FROM=noreply@yourdomain.com
   FRONTEND_URL=https://your-crm-domain.com
   ```

### Option 3: Using Other Email Services

Nodemailer supports many email services. Update the `emailService.ts` file with your service configuration:

```typescript
const transporter = nodemailer.createTransport({
  service: 'your-service',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

## Testing

To test the email functionality:

1. Start your backend server
2. Go to the Users page in the CRM
3. Click "Add User" and create a new user
4. Check the email inbox for the welcome email

## Email Template

The welcome email includes:

- **Professional HTML formatting** with clear sections
- **Login information** with temporary password
- **Step-by-step instructions** for changing password
- **Password requirements** clearly listed
- **Security notice** about password expiration
- **Getting started guide** with available features
- **Plain text version** for email clients that don't support HTML

## Troubleshooting

### Email not sending?

1. **Check environment variables**: Ensure all email variables are set correctly
2. **Check logs**: Look at server console for error messages
3. **Gmail users**: Make sure you're using an App Password, not your regular Gmail password
4. **Firewall**: Ensure your server can reach the email service (port 587 or 465)

### Email going to spam?

1. **Set up SPF/DKIM records** for your domain
2. **Use a professional email address** (not a free Gmail account for production)
3. **Verify your sender domain** with SendGrid or your email service

### "Cannot find module 'nodemailer'"?

Install the package:
```bash
npm install nodemailer @types/nodemailer
```

## Security Notes

- **Never commit `.env` files** to version control
- **Use App Passwords** instead of your actual Gmail password
- **Rotate API keys** regularly
- **Use HTTPS** for your frontend URL in production
- **Temporary passwords expire after 24 hours** - users must change them on first login

## Customization

To customize the email template, edit `/backend/src/utils/emailService.ts`:

- Change the HTML styling in the `htmlContent` variable
- Modify the text version in the `textContent` variable
- Update the email subject line
- Add your company logo or branding

## Support

If you encounter issues with email setup, check:
1. Email service documentation
2. Nodemailer documentation: https://nodemailer.com
3. Server logs for detailed error messages
