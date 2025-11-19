import nodemailer from 'nodemailer';

// Email configuration - update these with your email service credentials
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendNewUserEmail = async (
  email: string,
  firstName: string,
  lastName: string,
  tempPassword: string
): Promise<void> => {
  const loginUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const settingsUrl = `${loginUrl}/settings`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f0f0f0; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .content { margin: 20px 0; }
          .section { margin: 15px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #007bff; }
          .button { display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .warning { background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to FX Unlocked CRM!</h1>
          </div>

          <div class="content">
            <p>Hi ${firstName} ${lastName},</p>
            
            <p>Your account has been created in the FX Unlocked CRM system. Below are your login credentials and important information to get started.</p>

            <div class="section">
              <h3>Login Information</h3>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Temporary Password:</strong> <code>${tempPassword}</code></p>
              <p><a href="${loginUrl}" class="button">Login to CRM</a></p>
            </div>

            <div class="section">
              <h3>Important: Change Your Password</h3>
              <p>For security reasons, you must change your password immediately after your first login.</p>
              <ol>
                <li>Go to <a href="${loginUrl}">CRM Login</a></li>
                <li>Enter your email and temporary password</li>
                <li>Click on "Settings" in the sidebar</li>
                <li>Go to "Change Password" section</li>
                <li>Enter your current password and create a new strong password</li>
              </ol>
            </div>

            <div class="section">
              <h3>Password Requirements</h3>
              <p>Your new password must contain:</p>
              <ul>
                <li>At least 8 characters</li>
                <li>One uppercase letter (A-Z)</li>
                <li>One lowercase letter (a-z)</li>
                <li>One number (0-9)</li>
                <li>One special character (!@#$%^&* etc)</li>
              </ul>
            </div>

            <div class="warning">
              <strong>⚠️ Security Notice:</strong> This temporary password will expire after 24 hours. If you don't change it within this time, please contact your administrator to reset it.
            </div>

            <div class="section">
              <h3>Getting Started</h3>
              <p>Once you've logged in and changed your password, you'll have access to:</p>
              <ul>
                <li>Dashboard with key metrics and analytics</li>
                <li>Affiliate management and tracking</li>
                <li>Revenue and commission tracking</li>
                <li>Staff performance dashboards</li>
                <li>Account settings and profile management</li>
              </ul>
            </div>

            <p>If you have any questions or need assistance, please contact your administrator.</p>

            <p>Best regards,<br>FX Unlocked CRM Team</p>
          </div>

          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} FX Unlocked. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const textContent = `
Welcome to FX Unlocked CRM!

Hi ${firstName} ${lastName},

Your account has been created in the FX Unlocked CRM system.

LOGIN INFORMATION:
Email: ${email}
Temporary Password: ${tempPassword}

IMPORTANT: Change Your Password
For security reasons, you must change your password immediately after your first login.

1. Go to ${loginUrl}
2. Enter your email and temporary password
3. Click on "Settings" in the sidebar
4. Go to "Change Password" section
5. Enter your current password and create a new strong password

PASSWORD REQUIREMENTS:
Your new password must contain:
- At least 8 characters
- One uppercase letter (A-Z)
- One lowercase letter (a-z)
- One number (0-9)
- One special character (!@#$%^&* etc)

SECURITY NOTICE: This temporary password will expire after 24 hours. If you don't change it within this time, please contact your administrator to reset it.

If you have any questions, please contact your administrator.

Best regards,
FX Unlocked CRM Team
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to FX Unlocked CRM - Account Created',
      html: htmlContent,
      text: textContent,
    });
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send welcome email to ${email}:`, error);
    // Don't throw error - user creation should succeed even if email fails
  }
};
