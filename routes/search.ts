import { supabase } from "@app/supabase.ts";
import type { Context } from "hono";

export async function searchHandler(c: Context) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  try {
    // Clean and prepare the search query
    const cleanQuery = c.req.param("query").trim().replace(/\s+/g, " & ");

    // If query is empty, return early
    if (!cleanQuery) {
      return c.json({ data: [], error: null });
    }

    // Perform the search with multiple approaches and combine results
    const { data, error } = await supabase
      .from("products")
      .select("name, slug, image_url")
      .textSearch("search_vector", cleanQuery)
      .limit(10);

    if (error) {
      console.error("Search error:", error);
      return c.json({ data: null, error });
    }
    return c.json({ data, error: null });
  } catch (error) {
    console.error("Unexpected error:", error);
    return c.json({ data: null, error });
  }
}
