import type { LayoutProps } from "@app/layouts/RootLayout.tsx";
import { mountAssets } from "@app/middleware/assets.ts";
import { renderer } from "@app/middleware/render.tsx";
import { indexHandler } from "@app/routes/index.tsx";
import { Hono } from "hono";

declare module "hono" {
	interface ContextRenderer {
		(
			content: string | Promise<string>,
			props: LayoutProps,
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

/***********************************************************
    Data Objects
 ************************************************************/

interface Collection {
	id: number;
	name: string;
	slug: string;
}

interface Category {
	collection_id: number;
	name: string;
	slug: string;
	image_url: string;
}

interface SubCollection {
	id: number;
	category_slug: string;
	name: string;
}

interface SubCategory {
	subcollection_id: number;
	name: string;
	slug: string;
	image_url: string;
}

interface Product {
	slug: string;
	name: string;
	description: string;
	price: number;
	subcategory_slug: string;
	image_url: string;
}

// /***********************************************************
//     Static shell
// ************************************************************/

// const Shell = (p: PropsWithChildren<{ meta: any }>) => (
// 	<html lang="en">
// 		<head>
// 			<meta charset="utf-8" />
// 			<meta
// 				name="viewport"
// 				content="width=device-width, initial-scale=1"
// 			/>
// 			<title>Hello world</title>
// 			<link rel="stylesheet" href={useAsset("/styles.css")} />
// 			<script src={useAsset("/client.js")} type="module"></script>
// 			<script src="/worker.js" type="module" defer></script>
// 		</head>
// 		<body>
// 			<div id="loader" className="loader" />
// 			<Header />
// 			<main>
// 				{p.children}
// 			</main>
// 			<Footer />
// 		</body>
// 	</html>
// );

// /***********************************************************
//     Default Layout
//  ************************************************************/

// export const DefaultLayout = async (props: PropsWithChildren) => {
// 	const c = await supabase.from("collections").select("name, slug");
// 	return (
// 		<div class="default-layout" slot="main">
// 			<aside class="sidebar-nav">
// 				<h2>Choose a Collection</h2>
// 				{c.data?.map((collection: any) => (
// 					<a
// 						class={"hoverable"}
// 						preload
// 						href={`/collections/${collection.slug}`}
// 					>
// 						{collection.name}
// 					</a>
// 				))}
// 			</aside>
// 			<div class="content">{props.children}</div>
// 		</div>
// 	);
// };

// export const Header = () => {
// 	return (
// 		<header class="header-root">
// 			<a preload={"eager"} href="/" class="logo">VanillaMaster</a>
// 			<product-search>
// 				<input class="search" placeholder="Search..."></input>
// 			</product-search>
// 			<div class="menu-wrapper">
// 				<a class="order-link">ORDER</a>
// 				<a class="order-history-link">ORDER HISTORY</a>
// 			</div>
// 		</header>
// 	);
// };

// export const Footer = () => {
// 	return (
// 		<footer>
// 			<ul>
// 				<li>Home</li>
// 				<li>Location</li>
// 				<li>Returns</li>
// 				<li>Careers</li>
// 				<li>Mobile App</li>
// 				<li>Solidworks Add-In</li>
// 				<li>Help</li>
// 				<li>Settings</li>
// 			</ul>
// 			<p>
// 				By using this website, you agree to check out the{" "}
// 				<a href="http://github.com/b3nten/vanilla-master">
// 					Source Code
// 				</a>
// 			</p>
// 		</footer>
// 	);
// };

// /***********************************************************
// 	Home Page
//  ************************************************************/

// export const HomePage = async () => {
// 	const c = await supabase.from("collections").select(
// 		`name, slug, categories:categories(*)`,
// 	);

// 	let imageCount = 0;

// 	return (
// 		<DefaultLayout>
// 			<div class="home">
// 				{c.data?.map((collection: any) => (
// 					<div>
// 						<h2>{collection.name}</h2>
// 						<div class="collection-wrapper">
// 							{collection.categories.map((category: any) => (
// 								<a preload href={`/products/${category.slug}`}>
// 									<img
// 										loading={imageCount++ > 30
// 											? "lazy"
// 											: "eager"}
// 										width={100}
// 										height={100}
// 										src={category.image_url}
// 										alt={category.name}
// 									/>
// 									<p>{category.name}</p>
// 								</a>
// 							))}
// 						</div>
// 					</div>
// 				))}
// 			</div>
// 		</DefaultLayout>
// 	);
// };

// /***********************************************************
//     Collection Page
// ************************************************************/

// export const CollectionPage = async (props: { collection: string }) => {
// 	// all categories in collection
// 	const { data } = await supabase.from("collections").select(
// 		"*, categories:categories(*)",
// 	).eq("slug", props.collection).single();
// 	return (
// 		<DefaultLayout>
// 			<div class="collection-page">
// 				<div>
// 					<h2>{data.name}</h2>
// 					<div className="collection-wrapper">
// 						{data.categories.map((category: any) => (
// 							<a preload href={`/products/${category.slug}`}>
// 								<img
// 									loading={"eager"}
// 									width={100}
// 									height={100}
// 									src={category.image_url}
// 									alt={category.name}
// 								/>
// 								<p>{category.name}</p>
// 							</a>
// 						))}
// 					</div>
// 				</div>
// 			</div>
// 		</DefaultLayout>
// 	);
// };

// /***********************************************************
//     Category Page
//  ************************************************************/

// export const CategoryPage = async (props: { category: string }) => {
// 	const subcollections = await supabase.from("subcollections").select("*").eq(
// 		"category_slug",
// 		props.category,
// 	);

// 	const { data: subcategories } = await supabase
// 		.from("subcategories")
// 		.select("*").in(
// 			"subcollection_id",
// 			subcollections.data!.map((x: any) => x.id),
// 		);

// 	const organizedData = subcollections.data!.map((subcollection) => ({
// 		...subcollection,
// 		subcategories: subcategories!.filter(
// 			(subcat) => subcat.subcollection_id === subcollection.id,
// 		),
// 	}));

// 	return (
// 		<DefaultLayout>
// 			<div class="category-page">
// 				{organizedData.map((subcollection: any) => (
// 					<div class="category-wrapper">
// 						<h2>{subcollection.name}</h2>
// 						<ul>
// 							{subcollection.subcategories.map((
// 								subcategory: any,
// 							) => (
// 								<li>
// 									<a
// 										preload
// 										class="hoverable"
// 										href={`/products/${props.category}/${subcategory.slug}`}
// 									>
// 										<img
// 											loading={"lazy"}
// 											width={100}
// 											height={100}
// 											src={subcategory.image_url}
// 											alt={subcategory.name}
// 										/>
// 										<p>{subcategory.name}</p>
// 									</a>
// 								</li>
// 							))}
// 						</ul>
// 					</div>
// 				))}
// 			</div>
// 		</DefaultLayout>
// 	);
// };

// /***********************************************************
// 	Subcategory Page
//  ************************************************************/

// export const SubcategoryPage = async (props: { subcategory: string }) => {
// 	const products = await supabase.from("products").select("*").eq(
// 		"subcategory_slug",
// 		props.subcategory,
// 	);
// 	return (
// 		<DefaultLayout>
// 			<div className="subcategory-page">
// 				<div className="category-wrapper">
// 					<ul>
// 						{products.data?.map((subcategory: any) => (
// 							<li>
// 								<a
// 									preload
// 									className="hoverable"
// 									href={`/product/${subcategory.slug}`}
// 								>
// 									<img
// 										loading={"lazy"}
// 										width={100}
// 										height={100}
// 										src={subcategory.image_url}
// 										alt={subcategory.name}
// 									/>
// 									<p>{subcategory.name}</p>
// 								</a>
// 							</li>
// 						))}
// 					</ul>
// 				</div>
// 			</div>
// 		</DefaultLayout>
// 	);
// };

// /***********************************************************
// 	Product Page
//  ************************************************************/

// export const ProductPage = async (props: { product: string }) => {
// 	const product =
// 		(await supabase.from("products").select("*").eq("slug", props.product)
// 			.single()) as { data: Product };
// 	const relatedProducts = await supabase.from("products").select("*").neq(
// 		"slug",
// 		props.product,
// 	).limit(6);
// 	return (
// 		<DefaultLayout>
// 			<section class="product-page">
// 				<h1 class="title">{product.data.name}</h1>
// 				<div class="image-description">
// 					<img
// 						width={350}
// 						height={350}
// 						src={product.data.image_url}
// 						loading="eager"
// 					/>
// 					<p>{product.data.description}</p>
// 				</div>
// 				<p class="price">${product.data.price}</p>
// 				<form
// 					class="cart-form"
// 					method="post"
// 					action={"/cart/add/" + product.data.slug}
// 				>
// 					<button class="add-to-cart">Add to cart</button>
// 				</form>
// 				<div class="related">
// 					<h3>Explore more Products</h3>
// 					<ul class="grid">
// 						{relatedProducts.data?.map((product: any) => (
// 							<li>
// 								<a
// 									preload
// 									className="hoverable"
// 									href={`/product/${product.slug}`}
// 								>
// 									<img
// 										loading={"eager"}
// 										width={100}
// 										height={100}
// 										src={product.image_url}
// 										alt={product.name}
// 									/>
// 									<p>{product.name}</p>
// 								</a>
// 							</li>
// 						))}
// 					</ul>
// 				</div>
// 			</section>
// 		</DefaultLayout>
// 	);
// };

/***********************************************************
    Application instantiation.
 ************************************************************/

// app.get("/", (c) => {
// 	// get meta info
// 	const meta = {};
// 	return stream(c, async (s) => {
// 		s.write("<!DOCTYPE html>");
// 		s.write(await render(c, <Shell meta={meta}></Shell>));
// 		s.write(await render(c, <HomePage />));
// 	});
// });

// app.get("/products/:category/:subcategory", (c) => {
// 	const meta = {};
// 	return c.html(
// 		<Shell meta={meta}>
// 			<SubcategoryPage subcategory={c.req.param("subcategory")} />
// 		</Shell>,
// 	);
// });

// app.get("/products/:category", (c) => {
// 	const meta = {};
// 	return c.html(
// 		<Shell meta={meta}>
// 			<CategoryPage category={c.req.param("category")} />
// 		</Shell>,
// 	);
// });

// app.get("/collections/:collection", (c) => {
// 	const meta = {};
// 	return c.html(
// 		<Shell meta={meta}>
// 			<CollectionPage collection={c.req.param("collection")} />
// 		</Shell>,
// 	);
// });

// app.get("/product/:product", (c) => {
// 	const meta = {};
// 	return c.html(
// 		<Shell meta={meta}>
// 			<ProductPage product={c.req.param("product")} />
// 		</Shell>,
// 	);
// });

// app.get("/search/:query", async (c) => {
// 	await new Promise((resolve) => setTimeout(resolve, 500));
// 	try {
// 		// Clean and prepare the search query
// 		const cleanQuery = c.req.param("query").trim().replace(/\s+/g, " & ");

// 		// If query is empty, return early
// 		if (!cleanQuery) {
// 			return c.json({ data: [], error: null });
// 		}

// 		// Perform the search with multiple approaches and combine results
// 		const { data, error } = await supabase
// 			.from("products")
// 			.select("name, slug, image_url")
// 			.textSearch("search_vector", cleanQuery)
// 			.limit(10);

// 		if (error) {
// 			console.error("Search error:", error);
// 			return c.json({ data: null, error });
// 		}
// 		return c.json({ data, error: null });
// 	} catch (error) {
// 		console.error("Unexpected error:", error);
// 		return c.json({ data: null, error });
// 	}
// });

export default { fetch: app.fetch };
