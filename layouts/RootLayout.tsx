import Footer from "@app/components/Footer.tsx";
import Header from "@app/components/Header.tsx";
import { useAsset } from "@app/middleware/assets.ts";
import { Style } from "@app/styles.ts";
import type { PropsWithChildren } from "hono/jsx";

export type LayoutProps = {
    metadata: MetadataProps;
    preload?: PreloadProps[];
};

export default function Layout(
    { metadata, children, preload }: PropsWithChildren<LayoutProps>,
) {
    const Preloaded = () => {
        if (!preload) {
            return null;
        }

        return (
            <>
                {preload.map(({ href, ...props }) => (
                    <Preload href={useAsset(href)} {...props} />
                ))}
            </>
        );
    };

    return (
        <html lang="en">
            <head>
                <Metadata {...metadata} />
                <Preloaded />
                <Style />
                <link rel="stylesheet" href={useAsset("styles.css")} />
                <script src={useAsset("client.js")} />
            </head>
            <body>
                <div id="loader" className="loader" />
                <Header />
                <main>
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    );
}

export type MetadataProps = {
    title: string;
    description?: string;
    robots?: "index" | "noindex";
};

function Metadata(metadata: MetadataProps) {
    return (
        <>
            <meta charSet="utf-8" />
            <title>{metadata.title}</title>
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
            />
            <meta name="description" content={metadata.description ?? ""} />
            {/* Default to noindex */}
            <meta name="robots" content={metadata.robots ?? "noindex"} />
        </>
    );
}

export type PreloadProps = {
    href: string;
    as: "style" | "script" | "font" | "image" | "document";
    crossorigin?: "anonymous" | "use-credentials";
};

export function Preload(props: PreloadProps) {
    return <link rel="preload" {...props} />;
}
