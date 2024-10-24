import type { Context } from "hono";
import { supabase } from "@app/supabase.ts";
import MainLayout from "@app/layouts/MainLayout.tsx";

async function Collection({ collection }: { collection: string }) {
  const { data } = await supabase.from("collections").select(
    "*, categories:categories(*)",
  ).eq("slug", collection).single();

  return (
    <MainLayout>
      <div class="collection-page">
        <div>
          <h2>{data.name}</h2>
          <div className="collection-wrapper">
            {data.categories.map((category: any) => (
              <a preload href={`/products/${category.slug}`}>
                <img
                  loading="lazy"
                  width={100}
                  height={100}
                  src={category.image_url}
                  alt={category.name}
                />
                <p>{category.name}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export function collectionHandler(c: Context) {
  const collection = c.req.param("collection");
  return c.render(<Collection collection={collection} />);
}
