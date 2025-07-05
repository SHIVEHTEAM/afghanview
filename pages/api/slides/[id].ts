import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      console.log("Fetching slide with ID:", id);

      const { data, error } = await supabase
        .from("slides")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Database error:", error);
        return res.status(404).json({
          error: "Slide not found",
          details: error,
        });
      }

      console.log("Slide fetched successfully:", data);
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching slide:", error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  } else if (req.method === "PUT") {
    try {
      const updateData = req.body;
      console.log("Updating slide with ID:", id, "Data:", updateData);

      const { data, error } = await supabase
        .from("slides")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        return res.status(500).json({
          error: `Database error: ${error.message}`,
          details: error,
        });
      }

      console.log("Slide updated successfully:", data);
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error updating slide:", error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  } else if (req.method === "DELETE") {
    try {
      console.log("Deleting slide with ID:", id);

      const { error } = await supabase.from("slides").delete().eq("id", id);

      if (error) {
        console.error("Database error:", error);
        return res.status(500).json({
          error: `Database error: ${error.message}`,
          details: error,
        });
      }

      console.log("Slide deleted successfully");
      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting slide:", error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).json({ error: "Method not allowed" });
  }
}
