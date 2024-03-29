import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightTypeDoc, { typeDocSidebarGroup } from "starlight-typedoc";
import react from "@astrojs/react";
import path from "path";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";

export default defineConfig({
  vite: {
    optimizeDeps: {
      // Only needed for this repo
      include: [
        "@jimp/core",
        "@jimp/plugin-print",
        "@jimp/plugin-print/load-font",
      ],
      // Needed for anyone using the browser
      // Mainly just for Buffer
      esbuildOptions: {
        define: {
          global: "globalThis",
        },
        plugins: [NodeGlobalsPolyfillPlugin({ buffer: true })],
      },
    },
  },
  integrations: [
    react(),
    starlight({
      title: "Jimp",
      social: {
        github: "https://github.com/withastro/starlight",
      },
      sidebar: [
        {
          label: "Docs",
          items: [
            // Each item here is one entry in the navigation menu.
            { label: "Example Guide", link: "/guides/example/" },
            { label: "Using in Browser", link: "/guides/browser/" },
          ],
        },
        typeDocSidebarGroup,
      ],
      plugins: [
        starlightTypeDoc({
          entryPoints: [
            "../../packages/jimp/src/index.ts",
            "../../packages/jimp/src/fonts.ts",
          ],
          tsconfig: "../../packages/jimp/tsconfig.json",
          typeDoc: {
            groupOrder: ["Classes", "Functions", "Enumerations", "Variables"],
            sort: ["static-first", "alphabetical"],
            plugin: [
              path.join(
                path.dirname(import.meta.url).replace("file:", ""),
                "./src/typedoc-plugin.js"
              ),
            ],
          },
        }),
      ],
    }),
  ],
});
