import { Hono } from "hono";
import { cache } from "hono/cache";

import type { LayoutProps } from "@app/layouts/RootLayout.tsx";
import { mountAssets } from "@app/middleware/assets.ts";
import { renderer } from "@app/middleware/render.tsx";

import { indexHandler } from "@app/routes/index.tsx";
import { searchHandler } from "@app/routes/search.ts";
import { subCategoryHandler } from "@app/routes/sub-category.tsx";
import { categoryHandler } from "@app/routes/category.tsx";
import { productHandler } from "@app/routes/product.tsx";
import { collectionHandler } from "@app/routes/collection.tsx";

declare module "hono" {
  interface ContextRenderer {
    (
      content: string | Promise<string>,
      props?: LayoutProps,
    ): Response;
  }
}

const app = new Hono();
const assets = new Map<string, string>();
const assetsRouter = await mountAssets("./static", assets);

console.log(assets);

app.route("/", assetsRouter);
app.get(
  "*",
  cache({
    cacheName: "v0",
    cacheControl: "max-age=3600",
    wait: true,
  }),
  renderer({
    assets,
    defaultPreload: [{
      href: "styles.css",
      as: "style",
    }, {
      href: "client.js",
      as: "script",
    }],
  }),
);

app.get("/", indexHandler);
app.get("/products/:category", categoryHandler);
app.get("/products/:category/:subcategory", subCategoryHandler);
app.get("/collections/:collection", collectionHandler);
app.get("/product/:product", productHandler);
app.get("/search/:query", searchHandler);

export default { fetch: app.fetch };
