import { supabase } from "@app/supabase.ts";
import MainLayout from "@app/layouts/MainLayout.tsx";
import type { Context } from "hono";

interface ProductData {
  slug: string;
  name: string;
  description: string;
  price: number;
  subcategory_slug: string;
  image_url: string;
}

async function Product({ product }: { product: string }) {
  const response =
    (await supabase.from("products").select("*").eq("slug", product)
      .single()) as { data: ProductData };

  const relatedProducts = await supabase.from("products").select("*").neq(
    "slug",
    product,
  ).limit(6);

  return (
    <MainLayout>
      <section class="product-page">
        <h1 class="title">{response.data.name}</h1>
        <div class="image-description">
          <img
            width={350}
            height={350}
            src={response.data.image_url}
            loading="eager"
          />
          <p>{response.data.description}</p>
        </div>
        <p class="price">${response.data.price}</p>
        <form
          class="cart-form"
          method="post"
          action={"/cart/add/" + response.data.slug}
        >
          <button class="add-to-cart">Add to cart</button>
        </form>
        <div class="related">
          <h3>Explore more Products</h3>
          <ul class="grid">
            {relatedProducts.data?.map((product: any) => (
              <li>
                <a
                  className="hoverable"
                  href={`/product/${product.slug}`}
                >
                  <img
                    loading="lazy"
                    width={100}
                    height={100}
                    src={product.image_url}
                    alt={product.name}
                  />
                  <p>{product.name}</p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </MainLayout>
  );
}

export function productHandler(c: Context) {
  const product = c.req.param("product");
  return c.render(<Product product={product} />);
}
