import { walk, type WalkOptions } from "@std/fs/walk";
import { extname } from "@std/path/extname";
import { relative } from "@std/path/relative";
import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { createContext, useContext } from "hono/jsx";

export const AssetsContext = createContext<Map<string, string>>(new Map());

export function useAsset(path: string) {
    const assets = useContext(AssetsContext);
    // Strip the leading slash if it exists
    path = path.replace(/^\//, "");

    return assets.get(path) ?? path;
}

export async function mountAssets(
    path: string,
    assets: Map<string, string>,
    options?: WalkOptions,
) {
    const router = new Hono();
    const entries = walk(path, { ...options, includeDirs: false });

    for await (const entry of entries) {
        const content = await Deno.readFile(entry.path);
        const hashedContents = await digest(content);
        const hash = hashedContents.substring(0, 7);

        const relativePath = relative(path, entry.path);
        const extension = extname(relativePath);
        const hashedFilename = relativePath.replace(
            extension,
            `.${hash}${extension}`,
        );

        assets.set(relativePath, `/${hashedFilename}`);

        router.get(
            `/${hashedFilename}`,
            serveStatic({
                path: entry.path,
                onFound(_path, c) {
                    c.header(
                        "Cache-Control",
                        `public, immutable, max-age=31536000`,
                    );
                },
                rewriteRequestPath(path) {
                    return path.replace(`.${hash}`, "");
                },
            }),
        );
    }

    return router;
}

async function digest(message: Uint8Array, algo = "SHA-1") {
    return Array.from(
        new Uint8Array(
            await crypto.subtle.digest(algo, message),
        ),
        (byte) => byte.toString(16).padStart(2, "0"),
    ).join("");
}
