import { NextApiRequest, NextApiResponse } from "next";
import { emailService } from "../../../lib/simple-email-api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { to, subject, html, text, from } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Queue the email
    const emailId = await emailService.queueEmail(
      to,
      subject,
      html,
      text || ""
    );

    // Get queue status
    const queueStatus = emailService.getQueueStatus();

    return res.status(200).json({
      success: true,
      emailId,
      message: "Email queued successfully",
      queueStatus,
    });
  } catch (error) {
    console.error("Error in email API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
