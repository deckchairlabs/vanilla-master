import MainLayout from "@app/layouts/MainLayout.tsx";
import { supabase } from "@app/supabase.ts";
import type { Context } from "hono";

async function SubCategory(props: { subcategory: string }) {
  const products = await supabase.from("products").select("*").eq(
    "subcategory_slug",
    props.subcategory,
  );
  return (
    <MainLayout>
      <div className="subcategory-page">
        <div className="category-wrapper">
          <ul>
            {products.data?.map((subcategory: any) => (
              <li>
                <a
                  className="hoverable"
                  href={`/product/${subcategory.slug}`}
                >
                  <img
                    loading="lazy"
                    width={100}
                    height={100}
                    src={subcategory.image_url}
                    alt={subcategory.name}
                  />
                  <p>{subcategory.name}</p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </MainLayout>
  );
}

export async function subCategoryHandler(c: Context) {
  const subcategory = c.req.param("subcategory");
  return c.render(<SubCategory subcategory={subcategory} />);
}
