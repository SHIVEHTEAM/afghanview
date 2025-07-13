import nodemailer from "nodemailer";
import {
  generateStaffInvitationEmailHTML,
  generateStaffInvitationEmailText,
} from "./email-templates";

// Simple SMTP configuration
const createTransporter = () => {
  // Option 1: Gmail SMTP (requires app password)
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  // Option 2: Custom SMTP server
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Option 3: Ethereal Email (for testing)
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: process.env.ETHEREAL_USER || "test@ethereal.email",
      pass: process.env.ETHEREAL_PASS || "test123",
    },
  });
};

export async function sendEmailWithSMTP(
  to: string,
  subject: string,
  htmlContent: string,
  textContent: string
) {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.FROM_EMAIL || "noreply@shivehview.com",
      to,
      subject,
      html: htmlContent,
      text: textContent,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully:", {
      messageId: info.messageId,
      to,
      subject,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}

// Test email configuration
export async function testEmailConfiguration() {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("✅ Email configuration is valid");
    return { success: true };
  } catch (error) {
    console.error("❌ Email configuration failed:", error);
    return { success: false, error };
  }
}
