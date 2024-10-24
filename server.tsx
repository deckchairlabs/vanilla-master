import "jsr:@std/dotenv/load";
import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { PropsWithChildren } from "hono/jsx";
import { stream } from "hono/streaming"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const render = async (c: any, component: any) => await (await c.html(component)).text()

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_KEY")!)

/***********************************************************
    Data Objects
 ************************************************************/

interface Collection
{
	id: number
	name: string
	slug: string
}

interface Category
{
	collection_id: number
	name: string
	slug: string
	image_url: string
}

interface SubCollection
{
	id: number
	category_slug: string
	name: string
}

interface SubCategory
{
	subcollection_id: number
	name: string
	slug: string
	image_url: string
}

interface Product
{
	slug: string
	name: string
	description: string
	price: number
	subcategory_slug: string
	image_url: string
}

/***********************************************************
    Static shell
************************************************************/

const Shell = (p: PropsWithChildren<{ meta: any }>) => (
	<html lang="en">
		<head>
			<meta charset="utf-8"/>
			<meta name="viewport" content="width=device-width, initial-scale=1"/>
			<title>Hello world</title>
			<link rel="stylesheet" href="/styles.css"/>
			<script src="/client.js" type="module"></script>
			<script src="/worker.js" type="module" defer></script>
		</head>
		<body>
			<template id="lol" shadowrootmode="open">
				<link rel="stylesheet" href="/styles.css"/>
				<Header/>
				<main>
					<slot name="main"/>
				</main>
				<Footer/>
			</template>
		</body>
		{p.children}
	</html>
)

/***********************************************************
    Default Layout
 ************************************************************/

export const DefaultLayout = async (props: PropsWithChildren) => {
	const c = await supabase.from("collections").select("name, slug");
	return (
		<div class="default-layout" slot="main">
			<aside class="sidebar-nav">
				<h2>Choose a Collection</h2>
				{c.data?.map((collection: any) => (
					<a preload href={`/collections/${collection.slug}`}>{collection.name}</a>))}
			</aside>
			<div class="content">{props.children}</div>
		</div>
	)
}

export const Header = () => {
	return (
		<header class="header-root">
			<a href="/" class="logo">VanillaMaster</a>
			<input class="search" placeholder="Search..."></input>
			<div class="menu-wrapper">
				<a class="order-link">ORDER</a>
				<a class="order-history-link">ORDER HISTORY</a>
			</div>
		</header>
	)
}

export const Footer = () => {
	return (
		<footer>
			<ul>
				<li>Home</li>
				<li>Location</li>
				<li>Returns</li>
				<li>Careers</li>
				<li>Mobile App</li>
				<li>Solidworks Add-In</li>
				<li>Help</li>
				<li>Settings</li>
			</ul>
			<p>By using this website, you agree to check out the <a href="http://github.com/b3nten/vanilla-master">Source Code</a></p>
		</footer>
	)
}

/***********************************************************
	Home Page
 ************************************************************/

export const HomePage = async () => {

	const c = await supabase.from("collections").select(`name, slug, categories:categories(*)`);

	return (
		<DefaultLayout>
			<div class="home">
				{c.data?.map((collection: any) => (
					<div>
						<h2>{collection.name}</h2>
						<div class="collection-wrapper">
							{collection.categories.map((category: any) => (
								<a preload href={`/products/${category.slug}`}>
									<img loading={"lazy"} width={100} height={100} src={category.image_url}
										 alt={category.name}/>
									<p>{category.name}</p>
								</a>
							))}
						</div>
					</div>
				))}
			</div>
		</DefaultLayout>
	)
}

/***********************************************************
    Collection Page
************************************************************/

export const CollectionPage = async (props: { collection: string }) => {
	// all categories in collection
	const { data } = await supabase.from("collections").select("*, categories:categories(*)").eq("slug", props.collection).single()
	return (
		<DefaultLayout>
			{data.categories.map((category: any) => (
				<a preload href={`/products/${category.slug}`}>
					<p>{category.name}</p>
					<img loading={"lazy"} width={50} height={50} src={category.image_url} alt={category.name} />
				</a>
			))}
		</DefaultLayout>
	)
}

/***********************************************************
    Category Page
************************************************************/

export const CategoryPage = async (props: { category: string }) => {
	const subcollections = await supabase.from("subcollections").select("*").eq("category_slug", props.category)

	const { data: subcategories } = await supabase
		.from('subcategories')
		.select("*").in("subcollection_id", subcollections.data!.map((x: any) => x.id));

	const organizedData = subcollections.data!.map(subcollection => ({
		...subcollection,
		subcategories: subcategories!.filter(
			subcat => subcat.subcollection_id === subcollection.id
		)
	}));

	return (
		<DefaultLayout>
			{organizedData.map((subcollection: any) => (
				<div>
					<h2>{subcollection.name}</h2>
					{subcollection.subcategories.map((subcategory: any) => (
						<a preload href={`/products/${props.category}/${subcategory.slug}`}>
							<p>{subcategory.name}</p>
							<img loading={"lazy"} width={50} height={50} src={subcategory.image_url} alt={subcategory.name} />
						</a>
					))}
				</div>
			))}
		</DefaultLayout>
	)
}

/***********************************************************
	Subcategory Page
************************************************************/

export const SubcategoryPage = async (props: { subcategory: string }) => {
	const products = await supabase.from("products").select("*").eq("subcategory_slug", props.subcategory)
	return (
		<DefaultLayout>
			{products.data?.map((product: any) => (
				<a preload href={`/product/${product.slug}`}>
					<h3>{product.name}</h3>
					<p>{product.description}</p>
					<p>{product.price}</p>
					<img width={50} height={50} src={product.image_url} alt={product.name} />
				</a>
			))}
		</DefaultLayout>
	)
}

/***********************************************************
	Product Page
************************************************************/

export const ProductPage = async (props: { product: string }) => {
	const product = await supabase.from("products").select("*").eq("slug", props.product)
	return (
		<DefaultLayout>
			<pre>{JSON.stringify(product.data, null, 2)}</pre>
		</DefaultLayout>
	)
}

/***********************************************************
    Application instantiation.
 ************************************************************/

const app = new Hono();

app.get("/", (c) => {
	// get meta info
	const meta = {}
	return stream(c, async s => {
		s.write("<!DOCTYPE html>");
		s.write(await render(c, <Shell meta={meta}></Shell>));
		s.write(await render(c, <HomePage/>));
	});
});

app.get("/products/:category/:subcategory", (c) =>
{
	const meta = {}
	return c.html(<Shell meta={meta}><SubcategoryPage subcategory={c.req.param("subcategory")} /></Shell>)
});

app.get("/products/:category", (c) =>
{
	const meta = {}
	return c.html(<Shell meta={meta}><CategoryPage category={c.req.param("category")} /></Shell>)
});

app.get("/collections/:collection", (c) =>
{
	const meta = {}
	return c.html(<Shell meta={meta}><CollectionPage collection={c.req.param("collection")} /></Shell>)
});

app.get("/product/:product", (c) =>
{
	const meta = {}
	return c.html(<Shell meta={meta}><ProductPage product={c.req.param("product")} /></Shell>)
});

app.use("/client.js", serveStatic({ path: "./client.js" }));
app.use("/worker.js", serveStatic({ path: "./worker.js" }));
app.use("*", serveStatic({ root: "./static" }));

export default { fetch: app.fetch };
