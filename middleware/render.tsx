import Layout, {
  type MetadataProps,
  type PreloadProps,
} from "@app/layouts/RootLayout.tsx";
import { AssetsContext } from "@app/middleware/assets.ts";
import { jsxRenderer } from "hono/jsx-renderer";

type RendererOptions = {
  assets: Map<string, string>;
  defaultMetadata?: MetadataProps;
  defaultPreload?: PreloadProps[];
};

export function renderer(options: RendererOptions) {
  const { assets, defaultMetadata, defaultPreload } = options;

  return jsxRenderer(
    ({ children, metadata, preload, ...props }) => {
      const resolvedMetadata = {
        ...defaultMetadata,
        ...metadata,
      };

      const resolvedPreload = [
        ...(defaultPreload ?? []),
        ...(preload ?? []),
      ];

      return (
        <AssetsContext.Provider value={assets}>
          <Layout
            preload={resolvedPreload}
            metadata={resolvedMetadata}
            {...props}
          >
            {children}
          </Layout>
        </AssetsContext.Provider>
      );
    },
    { stream: true },
  );
}
