import { NextApiRequest, NextApiResponse } from "next";
// Deprecated: Auth now handled client-side via Supabase Auth.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res
    .status(410)
    .json({ error: "This endpoint is deprecated. Use Supabase Auth." });
}
