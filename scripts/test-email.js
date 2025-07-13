const nodemailer = require("nodemailer");
require("dotenv").config({ path: ".env.local" });

async function testEmailConfiguration() {
  console.log("🧪 Testing Hostinger Email Configuration...\n");

  // Check environment variables
  const requiredVars = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error("❌ Missing environment variables:", missingVars.join(", "));
    console.log("\nPlease add these to your .env.local file:");
    console.log("SMTP_HOST=smtp.hostinger.com");
    console.log("SMTP_PORT=587");
    console.log("SMTP_SECURE=false");
    console.log("SMTP_USER=noreply@shivehagency.com");
    console.log("SMTP_PASS=your_email_password");
    console.log("FROM_EMAIL=noreply@shivehagency.com");
    return;
  }

  // Create transporter
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    // Test connection
    console.log("🔗 Testing SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP connection successful!\n");

    // Send test email
    console.log("📧 Sending test email...");
    const testEmail = process.env.TEST_EMAIL || process.env.SMTP_USER;

    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: testEmail,
      subject: "🧪 ShivehView Email Test",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #667eea;">🎉 Email Test Successful!</h1>
          <p>This is a test email from your ShivehView application using Hostinger SMTP.</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Configuration Details:</h3>
            <ul>
              <li><strong>SMTP Host:</strong> ${process.env.SMTP_HOST}</li>
              <li><strong>SMTP Port:</strong> ${
                process.env.SMTP_PORT || "587"
              }</li>
              <li><strong>From Email:</strong> ${
                process.env.FROM_EMAIL || process.env.SMTP_USER
              }</li>
              <li><strong>Security:</strong> ${
                process.env.SMTP_SECURE === "true" ? "SSL" : "TLS"
              }</li>
            </ul>
          </div>
          <p>Your email configuration is working correctly! 🚀</p>
        </div>
      `,
      text: `
Email Test Successful!

This is a test email from your ShivehView application using Hostinger SMTP.

Configuration Details:
- SMTP Host: ${process.env.SMTP_HOST}
- SMTP Port: ${process.env.SMTP_PORT || "587"}
- From Email: ${process.env.FROM_EMAIL || process.env.SMTP_USER}
- Security: ${process.env.SMTP_SECURE === "true" ? "SSL" : "TLS"}

Your email configuration is working correctly! 🚀
      `,
    });

    console.log("✅ Test email sent successfully!");
    console.log("📧 Message ID:", info.messageId);
    console.log("📬 Check your inbox for the test email.\n");

    // Test different ports if needed
    console.log("🔧 Testing alternative configurations...");

    const configs = [
      { port: 587, secure: false, name: "Port 587 (TLS)" },
      { port: 465, secure: true, name: "Port 465 (SSL)" },
      { port: 587, secure: true, name: "Port 587 (SSL)" },
    ];

    for (const config of configs) {
      try {
        const testTransporter = nodemailer.createTransporter({
          host: process.env.SMTP_HOST,
          port: config.port,
          secure: config.secure,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await testTransporter.verify();
        console.log(`✅ ${config.name} - Working`);
      } catch (error) {
        console.log(`❌ ${config.name} - Failed`);
      }
    }
  } catch (error) {
    console.error("❌ Email test failed:", error.message);

    if (error.code === "EAUTH") {
      console.log("\n🔐 Authentication failed. Please check:");
      console.log("- Username and password are correct");
      console.log("- Email account is active");
      console.log("- Try generating an app password");
    } else if (error.code === "ECONNECTION") {
      console.log("\n🌐 Connection failed. Please check:");
      console.log("- SMTP host is correct (smtp.hostinger.com)");
      console.log("- Port settings (try 587 or 465)");
      console.log("- Firewall settings");
    } else if (error.code === "ETIMEDOUT") {
      console.log("\n⏰ Connection timeout. Please check:");
      console.log("- Internet connection");
      console.log("- SMTP server is accessible");
      console.log("- Try different port (465 instead of 587)");
    }
  }
}

// Run the test
testEmailConfiguration().catch(console.error);
