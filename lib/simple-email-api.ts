import {
  generateStaffInvitationEmailHTML,
  generateStaffInvitationEmailText,
} from "./email-templates";

// Simple email queue system
interface EmailQueueItem {
  id: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  status: "pending" | "sent" | "failed";
  createdAt: Date;
  attempts: number;
}

class SimpleEmailService {
  private queue: EmailQueueItem[] = [];
  private isProcessing = false;

  // Add email to queue
  async queueEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent: string
  ): Promise<string> {
    const emailId = `email_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const emailItem: EmailQueueItem = {
      id: emailId,
      to,
      subject,
      html: htmlContent,
      text: textContent,
      status: "pending",
      createdAt: new Date(),
      attempts: 0,
    };

    this.queue.push(emailItem);
    console.log(`📧 Email queued: ${emailId} to ${to}`);

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue();
    }

    return emailId;
  }

  // Process email queue
  private async processQueue() {
    if (this.isProcessing) return;

    this.isProcessing = true;
    console.log(`🔄 Processing email queue (${this.queue.length} items)`);

    while (this.queue.length > 0) {
      const emailItem = this.queue.shift();
      if (!emailItem) continue;

      try {
        await this.sendEmail(emailItem);
        emailItem.status = "sent";
        console.log(`✅ Email sent: ${emailItem.id}`);
      } catch (error) {
        emailItem.attempts++;
        emailItem.status = "failed";
        console.error(`❌ Email failed: ${emailItem.id}`, error);

        // Retry logic (max 3 attempts)
        if (emailItem.attempts < 3) {
          emailItem.status = "pending";
          this.queue.push(emailItem);
        }
      }

      // Small delay between emails to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    this.isProcessing = false;
    console.log("🏁 Email queue processing complete");
  }

  // Send individual email
  private async sendEmail(emailItem: EmailQueueItem): Promise<void> {
    // Option 1: Use webhook endpoint (if you have one)
    if (process.env.EMAIL_WEBHOOK_URL) {
      await this.sendViaWebhook(emailItem);
      return;
    }

    // Option 2: Use Resend API
    if (process.env.RESEND_API_KEY) {
      await this.sendViaResend(emailItem);
      return;
    }

    // Option 3: Log to console (for development)
    console.log("📧 Email would be sent:", {
      id: emailItem.id,
      to: emailItem.to,
      subject: emailItem.subject,
      html: emailItem.html.substring(0, 200) + "...",
    });
  }

  // Send via webhook
  private async sendViaWebhook(emailItem: EmailQueueItem): Promise<void> {
    const response = await fetch(process.env.EMAIL_WEBHOOK_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: emailItem.to,
        subject: emailItem.subject,
        html: emailItem.html,
        text: emailItem.text,
        from: process.env.FROM_EMAIL || "noreply@shivehview.com",
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status}`);
    }
  }

  // Send via Resend API
  private async sendViaResend(emailItem: EmailQueueItem): Promise<void> {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.FROM_EMAIL || "noreply@shivehview.com",
        to: emailItem.to,
        subject: emailItem.subject,
        html: emailItem.html,
        text: emailItem.text,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Resend API error: ${error.message}`);
    }
  }

  // Get queue status
  getQueueStatus() {
    return {
      total: this.queue.length,
      pending: this.queue.filter((item) => item.status === "pending").length,
      processing: this.isProcessing,
    };
  }
}

// Singleton instance
const emailService = new SimpleEmailService();

export { emailService };
export type { EmailQueueItem };
