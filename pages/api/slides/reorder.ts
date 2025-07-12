import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { business_id, restaurant_id, slide_orders } = req.body;

    // Support both old and new parameter names
    const actualBusinessId = business_id || restaurant_id;

    if (!actualBusinessId || !slide_orders || !Array.isArray(slide_orders)) {
      return res
        .status(400)
        .json({ error: "Business ID and slide orders array are required" });
    }

    // Update slide orders in a transaction
    const updates = slide_orders.map((item: any) => ({
      id: item.id,
      sort_order: item.sort_order,
    }));

    const { error: updateError } = await supabase
      .from("slides")
      .upsert(updates, { onConflict: "id" });

    if (updateError) {
      console.error("Error updating slide orders:", updateError);
      return res.status(500).json({ error: "Failed to update slide orders" });
    }

    // Return the updated slides
    const { data: updatedSlides, error: fetchError } = await supabase
      .from("slides")
      .select("*")
      .eq("business_id", actualBusinessId)
      .order("sort_order", { ascending: true });

    if (fetchError) {
      console.error("Error fetching updated slides:", fetchError);
      return res.status(200).json({ message: "Slides reordered successfully" });
    }

    return res.status(200).json(updatedSlides);
  } catch (error) {
    console.error("Error in PUT /api/slides/reorder:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
