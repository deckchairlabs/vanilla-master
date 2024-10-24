import MainLayout from "@app/layouts/MainLayout.tsx";
import type { Context } from "hono";
import { supabase } from "@app/supabase.ts";

async function Home() {
  const c = await supabase.from("collections").select(
    `name, slug, categories:categories(*)`,
  );

  let imageCount = 0;

  return (
    <MainLayout>
      <div class="home">
        {c.data?.map((collection: any) => (
          <div>
            <h2>{collection.name}</h2>
            <div class="collection-wrapper">
              {collection.categories.map((category: any) => (
                <a href={`/products/${category.slug}`}>
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
        ))}
      </div>
    </MainLayout>
  );
}

export function indexHandler(c: Context) {
  return c.render(<Home />, { metadata: { title: "Home" } });
}
