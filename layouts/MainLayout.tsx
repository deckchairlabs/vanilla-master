import type { PropsWithChildren } from "hono/jsx";
import { supabase } from "@app/supabase.ts";

export default async function MainLayout({ children }: PropsWithChildren) {
    const c = await supabase.from("collections").select("name, slug");
    return (
        <div class="default-layout" slot="main">
            <aside class="sidebar-nav">
                <h2>Choose a Collection</h2>
                {c.data?.map((collection: any) => (
                    <a
                        class={"hoverable"}
                        href={`/collections/${collection.slug}`}
                    >
                        {collection.name}
                    </a>
                ))}
            </aside>
            <div class="content">{children}</div>
        </div>
    );
}
