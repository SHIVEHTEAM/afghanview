export function generateStaffInvitationEmailHTML(data: {
  businessName: string;
  inviterName: string;
  role: string;
  acceptUrl: string;
  expiresAt: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isNewUser: boolean;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Staff Invitation - ${data.businessName}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .info-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">ShivehView</div>
            <h1>🎉 You're Invited!</h1>
            <p>Join ${data.businessName} on ShivehView</p>
        </div>
        
        <div class="content">
            <h2>Hello!</h2>
            <p>${data.inviterName} has invited you to join <strong>${
    data.businessName
  }</strong> as a <strong>${data.role}</strong> on ShivehView.</p>
            
            <div class="info-box">
                <h3>📋 Invitation Details:</h3>
                <ul>
                    <li><strong>Business:</strong> ${data.businessName}</li>
                    <li><strong>Role:</strong> ${data.role}</li>
                    <li><strong>Invited by:</strong> ${data.inviterName}</li>
                    <li><strong>Expires:</strong> ${new Date(
                      data.expiresAt
                    ).toLocaleDateString()}</li>
                </ul>
            </div>
            
            ${
              data.isNewUser
                ? `
            <div class="info-box" style="background: #e8f5e8; border-left-color: #28a745;">
                <h3>🔑 Your Login Credentials:</h3>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Temporary Password:</strong> ${data.password}</p>
                <p style="font-size: 14px; color: #666; margin-top: 10px;">
                    <strong>Important:</strong> Please change your password after your first login for security.
                </p>
            </div>
            `
                : `
            <div class="info-box" style="background: #e8f5e8; border-left-color: #28a745;">
                <h3>🔑 Sign In:</h3>
                <p><strong>Email:</strong> ${data.email}</p>
                <p style="font-size: 14px; color: #666; margin-top: 10px;">
                    Use your existing password to sign in and accept this invitation.
                </p>
            </div>
            `
            }
            
            <p>ShivehView is a powerful platform for creating and managing digital slideshows for your business. As a staff member, you'll be able to:</p>
            <ul>
                <li>Create and edit slideshows</li>
                <li>Manage content and media</li>
                <li>Collaborate with your team</li>
                <li>Access business analytics</li>
            </ul>
            
            <div style="text-align: center;">
                <a href="${data.acceptUrl}" class="button">Accept Invitation</a>
            </div>
            
            <p style="font-size: 14px; color: #666;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${data.acceptUrl}" style="color: #667eea;">${
    data.acceptUrl
  }</a>
            </p>
            
            <div class="footer">
                <p>This invitation will expire on ${new Date(
                  data.expiresAt
                ).toLocaleDateString()}.</p>
                <p>If you have any questions, please contact your team administrator.</p>
                <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                    <strong>ShivehView</strong><br>
                    Powered by Shiveh Agency<br>
                    <a href="mailto:${
                      process.env.FROM_EMAIL || "noreply@shivehview.com"
                    }" style="color: #667eea;">${
    process.env.FROM_EMAIL || "noreply@shivehview.com"
  }</a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

export function generateStaffInvitationEmailText(data: {
  businessName: string;
  inviterName: string;
  role: string;
  acceptUrl: string;
  expiresAt: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isNewUser: boolean;
}) {
  return `
You're Invited to Join ${data.businessName} on ShivehView!

Hello!

${data.inviterName} has invited you to join ${data.businessName} as a ${
    data.role
  } on ShivehView.

Invitation Details:
- Business: ${data.businessName}
- Role: ${data.role}
- Invited by: ${data.inviterName}
- Expires: ${new Date(data.expiresAt).toLocaleDateString()}

${
  data.isNewUser
    ? `
Your Login Credentials:
- Email: ${data.email}
- Temporary Password: ${data.password}

Important: Please change your password after your first login for security.
`
    : `
Sign In:
- Email: ${data.email}

Use your existing password to sign in and accept this invitation.
`
}

ShivehView is a powerful platform for creating and managing digital slideshows for your business. As a staff member, you'll be able to:
- Create and edit slideshows
- Manage content and media
- Collaborate with your team
- Access business analytics

To accept this invitation, click the link below:
${data.acceptUrl}

This invitation will expire on ${new Date(data.expiresAt).toLocaleDateString()}.

If you have any questions, please contact your team administrator.

Best regards,
The ShivehView Team
  `;
}
