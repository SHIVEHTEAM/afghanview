import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { authenticateRequest } from "../../../lib/auth-middleware";
import { rateLimit, getClientIdentifier } from "../../../lib/rate-limit";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Apply rate limiting
  const identifier = getClientIdentifier(req);
  const rateLimitResult = rateLimit(identifier, 100, 15 * 60 * 1000); // 100 requests per 15 minutes

  if (!rateLimitResult.allowed) {
    res.setHeader(
      "X-RateLimit-Remaining",
      rateLimitResult.remaining.toString()
    );
    res.setHeader("X-RateLimit-Reset", rateLimitResult.resetTime.toString());
    return res.status(429).json({ error: "Too many requests" });
  }

  res.setHeader("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
  res.setHeader("X-RateLimit-Reset", rateLimitResult.resetTime.toString());

  // Authenticate all requests
  const authenticatedReq = await authenticateRequest(req, res);
  if (!authenticatedReq) return;

  if (req.method === "GET") {
    try {
      // Only admins can see all slides, business owners see only their slides
      let query = supabase.from("slides").select(
        `
          *,
          business:businesses(id, name, slug)
        `
      );

      if (
        authenticatedReq.user?.role === "business_owner" &&
        authenticatedReq.user.business_id
      ) {
        query = query.eq("business_id", authenticatedReq.user.business_id);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        return res.status(500).json({
          error: "Database error",
        });
      }

      return res.status(200).json(data || []);
    } catch (error) {
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  } else if (req.method === "POST") {
    return handlePost(authenticatedReq, res);
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
}

async function handlePost(req: any, res: NextApiResponse) {
  try {
    const slideData = req.body;

    // Validate required fields
    if (!slideData.name || !slideData.title) {
      return res.status(400).json({ error: "Name and title are required" });
    }

    // Ensure business owners can only create slides for their business
    if (req.user?.role === "business_owner" && req.user.business_id) {
      slideData.business_id = req.user.business_id;
    }

    // Map the data to match the database schema
    const cleanSlideData = {
      business_id: slideData.business_id || null,
      template_id: slideData.template_id || null,
      name: slideData.name,
      type: slideData.type || "image",
      title: slideData.title,
      subtitle: slideData.subtitle || null,
      content: slideData.content || {},
      styling: slideData.styling || {},
      duration: slideData.duration || 6000,
      order_index: slideData.order_index || 0,
      is_active: slideData.is_active ?? true,
      is_published: slideData.is_published ?? false,
      is_locked: slideData.is_locked ?? false,
      published_at: slideData.published_at || null,
      published_by: slideData.published_by || null,
      created_by: req.user?.id,
      updated_by: req.user?.id,
    };

    const { data, error } = await supabase
      .from("slides")
      .insert(cleanSlideData)
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({
        error: error.message || "Database error",
        details: error.details || error,
      });
    }

    return res.status(201).json(data);
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
