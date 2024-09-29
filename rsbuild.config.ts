import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    title: "React Playground",
    favicon: "./public/react.svg",
  },
  tools: {
    rspack: {
      module: {
        rules: [
          {
            resourceQuery: /raw/,
            type: "asset/source",
          },
        ],
      },
    },
    bundlerChain(chain, { CHAIN_ID }) {
      // add this line
      chain.module.rule(CHAIN_ID.RULE.JS).resourceQuery({ not: /raw/ });
    },
  },
});
