import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        primary: { value: "#F32871" },
        secondary: { value: "black" },
        bgPrimary: { value: "#ffffff" },
      },
      fonts: {
        body: { value: "'Londrina Solid', sans-serif" },
      },
    },
  },
});
