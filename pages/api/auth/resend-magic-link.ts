import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { email } = req.body;
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Email is required" });
  }
  try {
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo: `${
          process.env.NEXT_PUBLIC_SITE_URL || "https://shivehview.com"
        }/onboarding`,
      }
    );
    if (error) {
      return res
        .status(500)
        .json({ error: error.message || "Failed to send magic link" });
    }
    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: err.message || "Failed to send magic link" });
  }
}
