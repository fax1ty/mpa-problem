import { defineConfig } from "vite";
import { swcReactRefresh } from "vite-plugin-swc-react-refresh";
import svgr from "vite-plugin-svgr";
import { createMpaPlugin } from "vite-plugin-virtual-mpa";
import { readdir } from "fs/promises";

const pagesDir = "./pages";

const getPages = async (path: string) => {
  const data = await readdir(path, { withFileTypes: true });
  const pages = [];
  for (const stats of data) {
    if (stats.isFile() && stats.name === "_entry.tsx") {
      pages.push({
        name: path.replace(pagesDir, "").replace("/", ""),
        entry: path + "/" + stats.name,
      });
    } else if (stats.isDirectory()) {
      const newPages = await getPages(path + "/" + stats.name);
      pages.push(...newPages);
    }
  }
  return pages;
};

export default defineConfig({
  plugins: [
    swcReactRefresh(),
    svgr(),
    createMpaPlugin({
      template: "index.html",
      rewrites: [
        {
          from: /\/(.*)/,
          to: (ctx) => `/${!ctx.match[1] ? "index" : ctx.match[1]}.html`,
        },
      ],
      pages: await getPages(pagesDir),
    }),
  ],
  esbuild: { jsx: "automatic" },
});
