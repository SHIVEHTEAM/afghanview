import { NextApiRequest, NextApiResponse } from "next";
import { emailService } from "../../../lib/simple-email-api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { emailId } = req.query;

    if (emailId) {
      // Get specific email status (if we implement tracking)
      return res.status(200).json({
        success: true,
        emailId,
        status: "sent", // For now, assume sent
        message: "Email status retrieved",
      });
    }

    // Get overall queue status
    const queueStatus = emailService.getQueueStatus();

    return res.status(200).json({
      success: true,
      queueStatus,
      message: "Email queue status retrieved",
    });
  } catch (error) {
    console.error("Error in email status API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
