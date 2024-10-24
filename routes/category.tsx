import type { Context } from "hono";
import MainLayout from "@app/layouts/MainLayout.tsx";
import { supabase } from "@app/supabase.ts";

async function Category(props: { category: string }) {
  const subcollections = await supabase.from("subcollections").select("*").eq(
    "category_slug",
    props.category,
  );

  const { data: subcategories } = await supabase
    .from("subcategories")
    .select("*").in(
      "subcollection_id",
      subcollections.data!.map((x: any) => x.id),
    );

  const organizedData = subcollections.data!.map((subcollection) => ({
    ...subcollection,
    subcategories: subcategories!.filter(
      (subcat) => subcat.subcollection_id === subcollection.id,
    ),
  }));

  return (
    <MainLayout>
      <div class="category-page">
        {organizedData.map((subcollection: any) => (
          <div class="category-wrapper">
            <h2>{subcollection.name}</h2>
            <ul>
              {subcollection.subcategories.map((
                subcategory: any,
              ) => (
                <li>
                  <a
                    preload
                    class="hoverable"
                    href={`/products/${props.category}/${subcategory.slug}`}
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
        ))}
      </div>
    </MainLayout>
  );
}

export async function categoryHandler(c: Context) {
  const category = c.req.param("category");
  return c.render(<Category category={category} />, {
    metadata: {
      title: "Products",
    },
  });
}
