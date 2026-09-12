import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/objetos/" : "/",

  build: {
    target: "es2020",
    sourcemap: false,
    cssMinify: true,
    reportCompressedSize: true,
  },

  plugins: [
    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "icon.svg",
      ],

      manifest: {
        id: "/objetos/",
        name: "Bit — Linguagem de Jogos",
        short_name: "Bit",
        description:
          "Linguagem de programação educacional em português para criar jogos 2D.",
        start_url: "/objetos/",
        scope: "/objetos/",
        display: "standalone",
        orientation: "any",
        background_color: "#090b0f",
        theme_color: "#090b0f",
        lang: "pt-BR",
        icons: [
          {
            src: "/objetos/icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },

      workbox: {
        navigateFallback: "/objetos/",
        globPatterns: [
          "**/*.{js,css,html,svg,png,webmanifest}",
        ],
      },
    }),
  ],
}));